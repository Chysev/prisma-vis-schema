import type { CreateProjectRequest, UpdateProjectRequest } from "@/validators/project.validator";
import { projectApi } from "../api/project.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useProjects = () => {
    const queryClient = useQueryClient();

    const getAllProjects = () => {
        const projects = useQuery({
            queryKey: ["projects", "all"],
            queryFn: projectApi.getAllProjects,
            staleTime: 2 * 60 * 1000,
        })

        return projects;
    }

    const getProjectById = (project_id: string) => {
        const project = useQuery({
            queryKey: ["projects", project_id],
            queryFn: () => projectApi.getProjectById({ project_id: project_id }),
            enabled: !!project_id,
            staleTime: 2 * 60 * 1000,
        });

        return project;
    }

    const createProjectMutation = useMutation({
        mutationFn: (data: CreateProjectRequest) => projectApi.createProject(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects", "all"] });
        },
        onError: (error) => {
            throw new Error(error.message || "Failed to create project")
        }
    })

    const updateProjectMutation = useMutation({
        mutationFn: (data: UpdateProjectRequest) => projectApi.updateProject(data),
        onSuccess: (result, variables) => {
            queryClient.invalidateQueries({ queryKey: ["projects", "all"] });
            queryClient.invalidateQueries({ queryKey: ["projects", variables.project_id] });
        },
        onError: (error) => {
            throw new Error(error.message || "Failed to update project")
        }
    })

    const deleteProjectMutation = useMutation({
        mutationFn: (data: { project_id: string }) => projectApi.deleteProject(data),
        onSuccess: (result, variables) => {
            queryClient.invalidateQueries({ queryKey: ["projects", "all"] });
            queryClient.invalidateQueries({ queryKey: ["projects", variables.project_id] });
        },
        onError: (error) => {
            throw new Error(error.message || "Failed to delete project")
        }
    })

    return {
        getAllProjects,
        getProjectById,
        createProjectMutation,
        updateProjectMutation,
        deleteProjectMutation
    }
};