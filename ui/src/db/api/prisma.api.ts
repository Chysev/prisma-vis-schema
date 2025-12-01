import api from "@/http/xior";

interface PrismaExecuteRequest {
    project_id: string;
    command: string;
    schema: string;
    database_url: string;
}

interface PrismaExecuteResponse {
    output?: string;
    error?: string;
    migration_files?: Array<{
        name: string;
        sql: string;
        timestamp: Date;
    }>;
}

export const prismaApi = {

    prisma_push: async (data: { project_id: string; prisma_schema: string }): Promise<void> => {
        try {
            await api.post("/projects/prisma/prisma_push", data);
        } catch (error) {
            throw error;
        }
    },

    executeCommand: async (data: PrismaExecuteRequest): Promise<PrismaExecuteResponse> => {
        try {
            const response = await api.post("/prisma/prisma_cli", data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};