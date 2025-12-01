import Cookies from "js-cookie";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import React, { useEffect, useState } from 'react';
import { useProjects } from '@/db/queries/useProjects';
import { Link, useNavigate } from '@tanstack/react-router';
import { Plus, LogOut, Database, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { type DatabaseProvider, DATABASE_PROVIDERS } from '@/types/app.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreateProjectModal } from "@/components/app/dashboard/createProject.modal";

const Dashboard = () => {
    const navigate = useNavigate();

    const [showCreateModal, setShowCreateModal] = useState(false);

    const { getAllProjects } = useProjects();
    const { data, isLoading, error, refetch } = getAllProjects();

    const onSubmit = () => {
        setShowCreateModal(true);
    }

    const handleLogout = () => {
        Cookies.remove(`${import.meta.env.VITE_TOKEN_NAME}`);
        setTimeout(() => {
            navigate({ to: "/auth/login" })
        }, 1000)
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex items-center gap-3 text-muted-foreground">
                    <Loader2 className="animate-spin" size={24} />
                    <span>Loading projects...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>Failed to load projects</AlertDescription>
                        </Alert>
                        <Button
                            onClick={() => navigate({ to: "/auth/login" })}
                            className="w-full"
                        >
                            Back to Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Prisma Schema Builder</h1>
                        <p className="text-muted-foreground mt-1">Create and manage your database schemas visually</p>
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={onSubmit} className="flex items-center gap-2">
                            <Plus size={18} /> New Project
                        </Button>
                        <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
                            <LogOut size={18} /> Logout
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data?.data.projects?.map((project) => (
                        <Link key={project.id} to={`/editor/${project.id}`}>
                            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                        <Database size={18} className="text-primary" />
                                        <CardTitle className="text-lg">{project.name}</CardTitle>
                                    </div>
                                    {project.database_provider && (
                                        <Badge variant="secondary" className="w-fit capitalize">
                                            {project.database_provider}
                                        </Badge>
                                    )}
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <p className="text-sm text-muted-foreground">
                                        Last updated: {new Date(project.updated_at).toLocaleDateString()}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>

            <CreateProjectModal
                open={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={(projectId) => {
                    setShowCreateModal(false);
                }}
                error={error}
                isPending={isLoading}
            />
        </div>
    )
}

export default Dashboard