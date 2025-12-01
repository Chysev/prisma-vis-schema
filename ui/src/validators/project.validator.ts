import { z } from 'zod';

export const projectSchema = z.object({
    id: z.string(),
    name: z.string(),
    project_id: z.string().optional(),
    database_provider: z.string().optional(),
    schema_json: z.string().optional(),
    prisma_schema: z.string().optional(),
    database_url: z.string().optional(),
    created_at: z.string(),
    updated_at: z.string(),
})

export const createProjectRequestSchema = z.object({
    name: z.string().min(4, 'Project name is required'),
    database_provider: z.string().optional(),
    database_url: z.string().optional(),
    schema_json: z.string().optional(),
    prisma_schema: z.string().optional(),
})

export const updateProjectRequestSchema = z.object({
    project_id: z.string().optional(),
    name: z.string().min(4, 'Project name is required').optional(),
    database_provider: z.string().optional(),
    database_url: z.string().optional(),
    schema_json: z.string().optional(),
    prisma_schema: z.string().optional(),
})

export type Project = z.infer<typeof projectSchema>;
export type CreateProjectRequest = z.infer<typeof createProjectRequestSchema>;
export type UpdateProjectRequest = z.infer<typeof updateProjectRequestSchema>;