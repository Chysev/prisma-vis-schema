import { z } from 'zod';

export const loginRequestSchema = z.object({
    email: z.string().email('Invalid email format').min(1, 'Email is required'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const registerRequestSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export const authResponseSchema = z.object({
    statusCode: z.number(),
    data: z.object({
        message: z.string(),
        token: z.string().min(1, 'Token is required'),
    }),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type RegisterRequest = z.infer<typeof registerRequestSchema>;