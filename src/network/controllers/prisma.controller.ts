import path from "path";
import Api from "@/lib/api";
import fs from "fs/promises";
import { promisify } from 'util';
const execAsync = promisify(exec);
import { exec } from 'child_process';
import { existsSync, mkdirSync } from "fs";
import { Request, Response, NextFunction } from "express";
import { HttpError } from "@/lib/error";

class PrismaController extends Api {

    private httpError = new HttpError()
    private static tempDirCache = new Map<string, string>()
    private static packageInstalled = new Set<string>()

    private async write_schema_file(schema_content: string, project_id: string) {
        const temp_dir = path.join(__dirname, "../../temp")

        if (!existsSync(temp_dir)) {
            mkdirSync(temp_dir, { recursive: true });
        }

        const file_path = path.join(temp_dir, `schema_${project_id}_${Date.now()}.prisma`);

        await fs.writeFile(file_path, schema_content);

        return file_path;
    }

    private async getOrCreateTempDir(project_id: string): Promise<string> {
        const cache_key = `project_${project_id}`;

        if (PrismaController.tempDirCache.has(cache_key)) {
            return PrismaController.tempDirCache.get(cache_key)!;
        }

        const temp_base_dir = path.join(process.cwd(), 'temp');
        await fs.mkdir(temp_base_dir, { recursive: true });
        const temp_dir = path.join(temp_base_dir, cache_key);
        await fs.mkdir(temp_dir, { recursive: true });

        PrismaController.tempDirCache.set(cache_key, temp_dir);
        return temp_dir;
    }

    private async setupProjectFiles(temp_dir: string, schema: string, database_url: string, project_id: string): Promise<void> {
        const schema_path = path.join(temp_dir, 'schema.prisma');

        const fileOps = [
            fs.writeFile(schema_path, schema),
            // fs.writeFile(path.join(temp_dir, '.env'), `DATABASE_URL="${database_url}"`)
        ]; if (!PrismaController.packageInstalled.has(project_id)) {
            const package_json = {
                name: `project_${project_id}`,
                version: "1.0.0",
                dependencies: {
                    '@prisma/client': '^7.0.1',
                    'prisma': '^7.0.1'
                }
            };

            const prisma_config = `import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: './schema.prisma',
  datasource: {
    url: '${database_url}',
  },
})`;

            fileOps.push(
                fs.writeFile(path.join(temp_dir, 'package.json'), JSON.stringify(package_json, null, 2)),
                fs.writeFile(path.join(temp_dir, 'prisma.config.ts'), prisma_config)
            );
        }

        await Promise.all(fileOps);
    }

    public async prisma_cli(req: Request, res: Response, next: NextFunction) {
        try {
            const { project_id, command, schema, database_url } = req.body;

            const temp_dir = await this.getOrCreateTempDir(project_id || 'default');

            await this.setupProjectFiles(temp_dir, schema, database_url, project_id || 'default');

            if (!PrismaController.packageInstalled.has(project_id || 'default')) {
                console.log(`Installing dependencies for project ${project_id}...`);
                await execAsync('yarn install --frozen-lockfile --silent', {
                    cwd: temp_dir,
                    timeout: 30000
                });
                PrismaController.packageInstalled.add(project_id || 'default');
            }

            console.log(`Executing command: ${command} in ${temp_dir}`);

            const { stdout, stderr } = await execAsync(command, {
                cwd: temp_dir,
                env: { ...process.env, DATABASE_URL: database_url },
                timeout: 45000
            });

            let update_schema: string | null = null;
            let migration_files: any[] = [];

            if (command.includes('db pull')) {
                try {
                    const schema_path = path.join(temp_dir, 'schema.prisma');
                    update_schema = await fs.readFile(schema_path, 'utf-8');
                } catch (error) {
                    console.error('Failed to read updated schema:', error);
                }
            }

            if (command.includes('migrate')) {
                try {
                    const migrations_dir = path.join(temp_dir, 'prisma', 'migrations');
                    const migrations_exist = await fs.access(migrations_dir).then(() => true).catch(() => false);

                    if (migrations_exist) {
                        const migration_folders = await fs.readdir(migrations_dir);

                        for (const folder of migration_folders) {
                            const migration_path = path.join(migrations_dir, folder);
                            const stat = await fs.stat(migration_path);

                            if (stat.isDirectory()) {
                                try {
                                    const migration_sql_path = path.join(migration_path, 'migration.sql');
                                    const migration_sql = await fs.readFile(migration_sql_path, 'utf-8');

                                    migration_files.push({
                                        name: folder,
                                        sql: migration_sql,
                                        timestamp: stat.mtime
                                    });
                                } catch (error) {
                                    console.log(`No migration.sql found in ${folder}`);
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.log('No migrations directory found or error reading migrations:', error);
                }
            }

            const data = {
                output: stdout,
                stderr: stderr,
                updated_schema: update_schema,
                migration_files: migration_files.length > 0 ? migration_files : undefined
            };

            this.success(res, data, "Prisma CLI Route");
        } catch (error: any) {
            const stdout = error.stdout || '';
            const stderr = error.stderr || '';
            const fullOutput = stdout + (stderr ? '\n' + stderr : '');

            return res.status(200).json({
                success: true,
                output: fullOutput,
                stderr: stderr,
                command: req.body.command,
                message: "Prisma CLI output (may include errors or warnings)",
                timestamp: new Date().toISOString()
            });
        }
    }

    public async prisma_push(req: Request, res: Response, next: NextFunction) {
        try {
            const { schema, database_url, project_id } = req.body;

            try {
                const schema_path = await this.write_schema_file(schema, project_id || 'temp');

                const { stdout, stderr } = await execAsync(`npx prisma db push --schema="${schema_path}"`, {
                    env: { ...process.env, DATABASE_URL: database_url },
                    timeout: 30000
                });

                const data = {
                    output: stdout,
                    stderr: stderr
                }

                this.success(res, data, "Prisma Push Route");
            } catch (error) {
                this.httpError.internalServerError("Prisma Push Failed");
            }
        } catch (error) {
            next(error)
        }
    }

    public async prisma_migrate(req: Request, res: Response, next: NextFunction) {
        try {
            const { schema, database_url, project_id, name } = req.body;

            try {
                const schema_path = await this.write_schema_file(schema, project_id || 'temp');

                const migration_name = name || `migration_${Date.now()}`;

                const { stdout, stderr } = await execAsync(`npx prisma migrate dev --name="${migration_name}" --schema="${schema_path}" --create-only`, {
                    env: { ...process.env, DATABASE_URL: database_url },
                    timeout: 60000
                });

                const data = {
                    output: stdout,
                    stderr: stderr
                }

                this.success(res, data, "Prisma Migrate Route");
            } catch (error) {
                this.httpError.internalServerError("Prisma Migrate Failed");
            }
        } catch (error) {
            next(error)
        }
    }

    public static async cleanup(): Promise<void> {
        try {
            const temp_base_dir = path.join(process.cwd(), 'temp');
            const entries = await fs.readdir(temp_base_dir, { withFileTypes: true });

            const cleanup_promises = entries
                .filter(entry => entry.isDirectory() && entry.name.startsWith('project_'))
                .map(async (entry) => {
                    try {
                        const dir_path = path.join(temp_base_dir, entry.name);
                        const stats = await fs.stat(dir_path);

                        if (Date.now() - stats.mtime.getTime() > 3600000) {
                            await fs.rm(dir_path, { recursive: true, force: true });
                            console.log(`Cleaned up old temp directory: ${entry.name}`);
                        }
                    } catch (error) {
                        console.warn(`Failed to cleanup directory ${entry.name}:`, error);
                    }
                });

            await Promise.all(cleanup_promises);
        } catch (error) {
            console.warn('Cleanup operation failed:', error);
        }
    }
}

setInterval(() => {
    PrismaController.cleanup();
}, 30 * 60 * 1000);

export default PrismaController;