import Api from "@/lib/api";
import prisma from "@/db/prisma";
import nanoid from "@/utils/genId";
import { Bcrypt } from "@/lib/bcrypt";
import { HttpError } from "@/lib/error";
import { Request, Response, NextFunction } from "express";

class ProjectsController extends Api {
    private httpError = new HttpError()

    public async getAllProjects(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.user;

            const projects = await prisma.projects.findMany({
                where: { user_id: id }
            })

            const data = {
                projects: projects
            }
            this.success(res, data, "Get All Projects Route");
        } catch (error) {
            next(error)
        }
    }

    public async getProjectById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.user;
            const { project_id } = req.body;

            const project = await prisma.projects.findUnique({
                where: { id: project_id, user_id: id }
            })

            if (!project) {
                return next(this.httpError.notFound("Project not found"));
            }

            const data = {
                project: project
            }
            this.success(res, data, "Get Project By ID Route");
        } catch (error) {
            next(error);
        }
    }

    public async createProject(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.user;
            const { name, schema_json, prisma_schema, database_url, database_provider } = req.body;

            const project = await prisma.projects.create({
                data: {
                    id: nanoid(),
                    name: name,
                    schema_json: schema_json,
                    prisma_schema: prisma_schema,
                    database_url: database_url,
                    database_provider: database_provider,
                    user: {
                        connect: { id: id }
                    }
                }
            })

            const data = {
                project: project
            }

            this.created(res, data, "Create Project Route");
        } catch (error) {
            next(error);
        }
    }

    public async updateProject(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.user;
            const { project_id, name, schema_json, prisma_schema, database_url, database_provider } = req.body;

            const project = await prisma.projects.findUnique({
                where: { id: project_id, user_id: id },
                select: { id: true }
            })

            if (!project) {
                return next(this.httpError.notFound("Project not found"));
            }

            const updated_project = await prisma.projects.update({
                where: { id: project_id, user_id: id },
                data: {
                    name: name,
                    schema_json: schema_json,
                    prisma_schema: prisma_schema,
                    database_url: database_url,
                    database_provider: database_provider
                }
            })

            const data = {
                project: updated_project
            }

            this.success(res, data, "Update Project Route");
        } catch (error) {
            next(error);
        }
    }

    public async deleteProject(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.user;
            const { project_id } = req.body;

            const project = await prisma.projects.findUnique({
                where: { id: project_id, user_id: id },
                select: { id: true }
            })

            if (!project) {
                return next(this.httpError.notFound("Project not found"));
            }

            await prisma.projects.delete({
                where: { id: project_id, user_id: id }
            })

            const data = {
                message: "Project deleted successfully"
            }

            this.success(res, data, "Delete Project Route");
        } catch (error) {
            next(error);
        }
    }
}

export default ProjectsController;