import { useProjects } from "@/db/queries/useProjects"
import { DATABASE_PROVIDERS, type DatabaseProvider } from "@/types/app.types";
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const CreateProjectModal = ({ open, onClose, onSuccess, error, isPending }: { open: boolean, onClose: () => void, onSuccess: (project_id: string) => void, error?: Error | null, isPending: boolean }) => {
    const [state, setState] = useState({
        name: '',
        database_provider: '' as DatabaseProvider,
        database_url: ''
    })

    const { createProjectMutation } = useProjects();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await createProjectMutation.mutateAsync({
                name: state.name,
                database_provider: state.database_provider,
                database_url: state.database_url,
                schema_json: JSON.stringify({ models: [], enums: [], relations: [] }),
                prisma_schema: ''
            });
            onSuccess(response.id.toString());
            onClose();;
        } catch (error) {
            console.error("Project creation failed.", error);
        }
    }

    const getPlaceholderDBUrl = (provider: DatabaseProvider) => {
        switch (provider) {
            case 'POSTGRESQL':
                return 'postgresql://user:password@localhost:5432/mydb';
            case 'MYSQL':
                return 'mysql://user:password@localhost:3306/mydb';
            case 'SQLITE':
                return 'file:./dev.db';
            case 'SQLSERVER':
                return 'sqlserver://localhost:1433;database=mydb;user=sa;password=password;';
            case 'MONGODB':
                return 'mongodb://localhost:27017/mydb';
            case 'COCKROACHDB':
                return 'postgresql://user:password@localhost:26257/mydb';
            default:
                return 'DATABASE_URL';
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                        Set up a new Prisma schema project to get started.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Project Name *
                        </label>
                        <Input
                            type="text"
                            value={state.name}
                            onChange={(e) => setState({ ...state, name: e.target.value })}
                            placeholder="My Awesome Project"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Database Provider *
                        </label>
                        <Select value={state.database_provider} onValueChange={(value: DatabaseProvider) => setState({ ...state, database_provider: value })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a database provider" />
                            </SelectTrigger>
                            <SelectContent>
                                {DATABASE_PROVIDERS.map(provider => (
                                    <SelectItem key={provider} value={provider}>
                                        {provider.charAt(0).toUpperCase() + provider.slice(1)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Database URL *
                        </label>
                        <Input
                            type="text"
                            value={state.database_url}
                            onChange={(e) => setState({ ...state, database_url: e.target.value })}
                            placeholder={getPlaceholderDBUrl(state.database_provider)}
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            You can use environment variables like: env("DATABASE_URL")
                        </p>
                    </div>

                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>
                                {error instanceof Error ? error.message : 'Failed to create project'}
                            </AlertDescription>
                        </Alert>
                    )}

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending || !state.name.trim() || !state.database_url.trim()}
                        >
                            {isPending ? 'Creating...' : 'Create Project'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}