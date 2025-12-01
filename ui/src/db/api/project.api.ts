import api from "@/http/xior";
import type { CreateProjectRequest, Project, UpdateProjectRequest } from "@/validators/project.validator";

export const projectApi = {

    getAllProjects: async (): Promise<{ data: { projects: Project[] } }> => {
        try {
            const response = await api.post("/projects/list")
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getProjectById: async (data: Partial<Project>): Promise<{ data: { project: Project } }> => {
        try {
            const response = await api.post(`/projects/getById`, data);

            return response.data
        } catch (error) {
            throw error;
        }
    },

    createProject: async (data: CreateProjectRequest): Promise<Project> => {
        try {
            const response = await api.post("/projects/create", data);

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateProject: async (data: UpdateProjectRequest): Promise<Project> => {
        try {
            const response = await api.post("/projects/update", data);

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    deleteProject: async (data: { project_id: string }): Promise<void> => {
        try {
            await api.post("/projects/delete", data);
        } catch (error) {
            throw error;
        }
    },
};