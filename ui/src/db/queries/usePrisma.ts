import { useMutation } from "@tanstack/react-query";
import { prismaApi } from "../api/prisma.api";

export const usePrisma = () => {
    const executeCommandMutation = useMutation({
        mutationFn: prismaApi.executeCommand,
        onError: (error) => {
            throw error;
        }
    });

    const prismaPushMutation = useMutation({
        mutationFn: prismaApi.prisma_push,
        onError: (error) => {
            throw error;
        }
    });

    return {
        executeCommandMutation,
        prismaPushMutation
    };
};