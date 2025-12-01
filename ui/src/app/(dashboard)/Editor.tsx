import ModelNode from '@/components/app/editor/ModelNode';
import EnumNode from '@/components/app/editor/EnumNode';
import { PropertiesPanel } from '@/components/app/editor/PropertiesPanel';
import RelationEdge from '@/components/app/editor/RelationEdge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useProjects } from '@/db/queries/useProjects';
import { usePrisma } from '@/db/queries/usePrisma';
import type { DatabaseProvider } from '@/types/app.types';
import { downloadPrismaSchema, PrismaSchemaGenerator } from '@/utils/prismaGenerator';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { useNavigate, useParams } from '@tanstack/react-router';
import { ArrowLeft, Badge, Boxes, Database, Download, GitBranch, Loader2, Play, RefreshCw, Save, Upload } from 'lucide-react';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import ReactFlow, { addEdge, Background, Controls, MiniMap, ReactFlowProvider, useEdgesState, useNodesState, type Connection, type Edge, type Node } from 'reactflow';
import 'reactflow/dist/style.css';

const nodeTypes = {
    model: ModelNode,
    enum: EnumNode,
};

const edgeTypes = {
    relation: RelationEdge,
    enumType: RelationEdge,
};

const initialNodes: Node[] = [];

const Editor = () => {
    return (
        <ReactFlowProvider>
            <EditorContent />
        </ReactFlowProvider>
    )
}

const EditorContent = () => {
    const { id } = useParams({
        from: "/editor/$id",
    });

    const navigate = useNavigate();
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

    const { updateProjectMutation, deleteProjectMutation, getProjectById } = useProjects();
    const { executeCommandMutation } = usePrisma();

    const { data: project_data, isLoading, error } = getProjectById(id!);

    const project = project_data?.data.project

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);

    const validateName = useCallback((newName: string, nodeId: string, nodeType: 'model' | 'enum') => {
        const existingNode = nodes.find(n =>
            n.id !== nodeId &&
            n.data.label === newName &&
            (n.type === 'model' || n.type === 'enum')
        );

        if (existingNode) {
            toast.error(`Name conflict: A ${existingNode.type} named "${newName}" already exists`, {
                description: 'Models and enums must have unique names in Prisma'
            });
            return false;
        }
        return true;
    }, [nodes]);

    const [prismaCommands, setPrismaCommands] = useState({
        isGenerating: false,
        isPushing: false,
        isMigrating: false,
        isPulling: false,
        output: '',
        error: ''
    });

    useLayoutEffect(() => {
        if (selectedNode) {
            const updatedNode = nodes.find(n => n.id === selectedNode.id);
            if (updatedNode) {
                setSelectedNode(updatedNode);
            }
        }
    }, [nodes, selectedNode?.id]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate({ to: "/auth/login" });
            return;
        }
    }, [navigate]);

    useLayoutEffect(() => {
        if (project?.schema_json) {
            try {
                const parsed = JSON.parse(project.schema_json);
                if (parsed.nodes) {
                    const nodesWithDragProps = parsed.nodes.map((node: Node) => ({
                        ...node,
                        draggable: true,
                        selectable: true
                    }));
                    setNodes(nodesWithDragProps);
                }
                if (parsed.edges) setEdges(parsed.edges);
            } catch (e) {
                console.error("Failed to parse schemaJson", e);
            }
        }
    }, [project, setNodes, setEdges]);



    const onConnect = useCallback((params: Connection) => {
        const sourceNode = nodes.find(n => n.id === params.source);
        const targetNode = nodes.find(n => n.id === params.target);

        if (sourceNode?.type === 'enum' || targetNode?.type === 'enum') {
            const enumNode = sourceNode?.type === 'enum' ? sourceNode : targetNode;
            const modelNode = sourceNode?.type === 'model' ? sourceNode : targetNode;

            if (enumNode && modelNode) {
                toast.success(`Select a field in ${modelNode.data.label} to assign ${enumNode.data.label} enum type`, {
                    description: "Click on the model to open properties panel, then edit a field's type"
                });
            }
            return;
        }

        const newEdge: Edge = {
            id: `edge-${Date.now()}`,
            source: params.source!,
            target: params.target!,
            sourceHandle: params.sourceHandle,
            targetHandle: params.targetHandle,
            type: 'relation',
            data: {
                relationType: 'ONE_TO_MANY',
                onDelete: 'CASCADE',
                isOptional: true,
            },
        };
        setEdges((eds) => addEdge(newEdge, eds));
    }, [setEdges, nodes]);

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');

            if (typeof type === 'undefined' || !type) {
                return;
            }

            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const isEnum = type === 'Enum';
            const baseName = `New${type}`;
            let uniqueName = baseName;
            let counter = 1;

            while (nodes.some(n => n.data.label === uniqueName && (n.type === 'model' || n.type === 'enum'))) {
                uniqueName = `${baseName}${counter}`;
                counter++;
            }

            const newNode: Node = {
                id: `${isEnum ? 'enum' : 'model'}-${Date.now()}`,
                type: isEnum ? 'enum' : 'model',
                position,
                draggable: true,
                selectable: true,
                data: isEnum ? {
                    label: uniqueName,
                    isEnum: true,
                    values: ['VALUE1', 'VALUE2']
                } : {
                    label: uniqueName,
                    fields: [
                        {
                            id: `field-${Date.now()}`,
                            name: 'id',
                            type: 'Int',
                            isId: true,
                            defaultValue: 'autoincrement()',
                            isOptional: false,
                            isArray: false,
                            isUnique: false,
                            isUpdatedAt: false
                        }
                    ]
                },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, setNodes]
    );

    const onNodeClick = useCallback((_event: React.MouseEvent, clickedNode: Node) => {
        const currentNode = nodes.find(n => n.id === clickedNode.id);
        setSelectedNode(currentNode || clickedNode);
        setSelectedEdge(null);
    }, [nodes]);

    const onEdgeClick = useCallback((_event: React.MouseEvent, clickedEdge: Edge) => {
        setSelectedEdge(clickedEdge);
        setSelectedNode(null);
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
        setSelectedEdge(null);
    }, []);

    const deleteSelectedEdge = useCallback(() => {
        if (selectedEdge) {
            if (selectedEdge.data?.isEnumType) {
                toast.warning('Enum type connections cannot be deleted directly', {
                    description: 'Change the field type in the model properties to remove the connection'
                });
                return;
            }
            setEdges(edges => edges.filter(edge => edge.id !== selectedEdge.id));
            setSelectedEdge(null);
        }
    }, [selectedEdge, setEdges]);

    const deleteNode = useCallback((nodeId: string) => {
        const nodeToDelete = nodes.find(n => n.id === nodeId);
        if (!nodeToDelete) return;

        setNodes(nds => nds.filter(n => n.id !== nodeId));

        setEdges(edges => edges.filter(edge =>
            edge.source !== nodeId && edge.target !== nodeId
        ));

        if (selectedNode?.id === nodeId) {
            setSelectedNode(null);
        }

        toast.success(`${nodeToDelete.type === 'enum' ? 'Enum' : 'Model'} "${nodeToDelete.data.label}" deleted successfully`);
    }, [nodes, setNodes, setEdges, selectedNode]);

    useLayoutEffect(() => {
        const enumEdges: Edge[] = [];

        nodes.forEach(modelNode => {
            if (modelNode.type === 'model' && modelNode.data.fields) {
                modelNode.data.fields.forEach((field: any) => {
                    const enumNode = nodes.find(n => n.type === 'enum' && n.data.label === field.type);
                    if (enumNode) {
                        const edgeId = `enum-edge-${modelNode.id}-${field.id || field.name}-${enumNode.id}`;
                        if (!enumEdges.find(e => e.id === edgeId)) {
                            enumEdges.push({
                                id: edgeId,
                                source: enumNode.id,
                                target: modelNode.id,
                                sourceHandle: 'enum-source',
                                targetHandle: 'model-target',
                                type: 'enumType',
                                data: {
                                    fieldName: field.name,
                                    enumName: enumNode.data.label,
                                    isEnumType: true
                                },
                                style: {
                                    stroke: '#8b5cf6',
                                    strokeWidth: 2,
                                    strokeDasharray: '5,5'
                                }
                            });
                        }
                    }
                });
            }
        });

        setEdges(currentEdges => {
            const nonEnumEdges = currentEdges.filter(edge => !edge.data?.isEnumType);
            return [...nonEnumEdges, ...enumEdges];
        });
    }, [nodes, setEdges]);

    const updateEdgeRelationType = useCallback((relationType: string) => {
        if (selectedEdge) {
            setEdges(edges => edges.map(edge =>
                edge.id === selectedEdge.id
                    ? { ...edge, data: { ...edge.data, relationType } }
                    : edge
            ));
            setSelectedEdge(prev => prev ? { ...prev, data: { ...prev.data, relationType } } : null);
        }
    }, [selectedEdge, setEdges]);

    const updateEdgeProperty = useCallback((property: string, value: any) => {
        if (selectedEdge) {
            setEdges(edges => edges.map(edge =>
                edge.id === selectedEdge.id
                    ? { ...edge, data: { ...edge.data, [property]: value } }
                    : edge
            ));
            setSelectedEdge(prev => prev ? { ...prev, data: { ...prev.data, [property]: value } } : null);
        }
    }, [selectedEdge, setEdges]);

    const updateProject = useCallback(async (updates: any) => {
        if (!project) return;

        try {
            await updateProjectMutation.mutateAsync({
                project_id: project.id,
                name: updates.name !== undefined ? updates.name : project.name,
                schema_json: project.schema_json,
                prisma_schema: project.prisma_schema,
                database_provider: updates.database_provider !== undefined ? updates.database_provider : project.database_provider,
                database_url: updates.database_url !== undefined ? updates.database_url : project.database_url
            });
            toast.success('Project updated successfully!');
        } catch (error) {
            console.error('Project update failed:', error);
            toast.error('Failed to update project');
        }
    }, [project, updateProjectMutation]);

    const deleteProject = useCallback(async () => {
        if (!project) return;

        try {
            await deleteProjectMutation.mutateAsync({
                project_id: project.id
            });
            toast.success('Project deleted successfully!');
            navigate({ to: '/dashboard' });
        } catch (error) {
            console.error('Project delete failed:', error);
            toast.error('Failed to delete project');
        }
    }, [project, deleteProjectMutation, navigate]);

    const generateSchema = useCallback(() => {
        if (!project) return '';

        const modelsWithRelations = nodes
            .filter(node => node.type === 'model')
            .map(node => ({
                id: node.id,
                name: node.data.label,
                fields: [...(node.data.fields || [])],
            }));

        const enums = nodes
            .filter(node => node.type === 'enum')
            .map(node => ({
                id: node.id,
                name: node.data.label,
                values: node.data.values || []
            }));

        const allNames = [
            ...modelsWithRelations.map(m => ({ name: m.name, type: 'model' })),
            ...enums.map(e => ({ name: e.name, type: 'enum' }))
        ];
        const duplicateNames = allNames.filter((item, index, arr) =>
            arr.findIndex(other => other.name === item.name) !== index
        );

        if (duplicateNames.length > 0) {
            const conflicts = [...new Set(duplicateNames.map(d => d.name))];
            throw new Error(`Schema validation failed: Naming conflicts detected for: ${conflicts.join(', ')}. Models and enums must have unique names.`);
        }

        edges.forEach(edge => {
            const sourceModel = modelsWithRelations.find(m => m.id === edge.source);
            const targetModel = modelsWithRelations.find(m => m.id === edge.target);

            if (!sourceModel || !targetModel) return;

            const relationType = edge.data?.relationType || 'ONE_TO_MANY';

            if (relationType === 'ONE_TO_MANY') {
                const arrayFieldName = `${targetModel.name.toLowerCase()}s`;
                if (!sourceModel.fields.find(f => f.name === arrayFieldName)) {
                    sourceModel.fields.push({
                        id: `rel-${edge.id}-source`,
                        name: arrayFieldName,
                        type: targetModel.name,
                        isArray: true,
                        isOptional: false,
                        isId: false,
                        isUnique: false,
                        isUpdatedAt: false,
                    });
                }

                const relationFieldName = sourceModel.name.toLowerCase();
                const foreignKeyName = `${sourceModel.name.toLowerCase()}_id`;

                if (!targetModel.fields.find(f => f.name === relationFieldName)) {
                    targetModel.fields.push({
                        id: `rel-${edge.id}-target`,
                        name: relationFieldName,
                        type: sourceModel.name,
                        isOptional: true,
                        isArray: false,
                        isId: false,
                        isUnique: false,
                        isUpdatedAt: false,
                        relationFields: [foreignKeyName],
                        relationReferences: ['id'],
                    });
                }

                if (!targetModel.fields.find(f => f.name === foreignKeyName)) {
                    targetModel.fields.push({
                        id: `fk-${edge.id}`,
                        name: foreignKeyName,
                        type: 'String',
                        isOptional: true,
                        isArray: false,
                        isId: false,
                        isUnique: false,
                        isUpdatedAt: false,
                    });
                }
            } else if (relationType === 'ONE_TO_ONE') {
                const relationFieldName = targetModel.name.toLowerCase();
                const foreignKeyName = `${targetModel.name.toLowerCase()}_id`;

                if (!sourceModel.fields.find(f => f.name === relationFieldName)) {
                    sourceModel.fields.push({
                        id: `rel-${edge.id}-source`,
                        name: relationFieldName,
                        type: targetModel.name,
                        isOptional: true,
                        isArray: false,
                        isId: false,
                        isUnique: false,
                        isUpdatedAt: false,
                        relationFields: [foreignKeyName],
                        relationReferences: ['id'],
                    });
                }

                if (!sourceModel.fields.find(f => f.name === foreignKeyName)) {
                    sourceModel.fields.push({
                        id: `fk-${edge.id}`,
                        name: foreignKeyName,
                        type: 'String',
                        isOptional: true,
                        isArray: false,
                        isId: false,
                        isUnique: true,
                        isUpdatedAt: false,
                    });
                }
            } else if (relationType === 'MANY_TO_MANY') {
                const sourceArrayField = `${targetModel.name.toLowerCase()}s`;
                const targetArrayField = `${sourceModel.name.toLowerCase()}s`;

                if (!sourceModel.fields.find(f => f.name === sourceArrayField)) {
                    sourceModel.fields.push({
                        id: `rel-${edge.id}-source`,
                        name: sourceArrayField,
                        type: targetModel.name,
                        isArray: true,
                        isOptional: false,
                        isId: false,
                        isUnique: false,
                        isUpdatedAt: false,
                    });
                }

                if (!targetModel.fields.find(f => f.name === targetArrayField)) {
                    targetModel.fields.push({
                        id: `rel-${edge.id}-target`,
                        name: targetArrayField,
                        type: sourceModel.name,
                        isArray: true,
                        isOptional: false,
                        isId: false,
                        isUnique: false,
                        isUpdatedAt: false,
                    });
                }
            }
        });

        const prismaProject = {
            id: project.id,
            name: project.name,
            databaseProvider: (project.database_provider?.toUpperCase() || 'POSTGRESQL') as DatabaseProvider,
            databaseUrl: project.database_url || 'env("DATABASE_URL")',
            models: modelsWithRelations,
            enums: enums,
            relations: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        return PrismaSchemaGenerator.generateSchema(prismaProject as any);
    }, [project, nodes, edges]);

    const handleSave = async () => {
        if (!project) return;

        try {
            const schemaJson = JSON.stringify({ nodes, edges });
            const prismaSchema = generateSchema();

            await updateProjectMutation.mutateAsync({
                project_id: project.id as string,
                name: project.name as string,
                schema_json: schemaJson as string,
                prisma_schema: prismaSchema as string,
                database_provider: project.database_provider as string,
                database_url: project.database_url as string
            });
            toast.success('Project saved successfully!');
        } catch (error) {
            console.error('Save failed:', error);
            if (error instanceof Error && error.message.includes('Schema validation failed')) {
                toast.error('Validation Error', {
                    description: error.message
                });
            } else {
                toast.error('Failed to save project');
            }
        }
    };

    const handleDownloadSchema = () => {
        if (!project) {
            toast.error('No project loaded');
            return;
        }

        try {
            const schema = generateSchema();
            if (!schema || schema.trim() === '') {
                toast.error('Generated schema is empty');
                return;
            }

            const fileName = project.name && project.name.trim()
                ? `${project.name}.prisma`
                : 'schema.prisma';

            downloadPrismaSchema(schema, fileName);
            toast.success('Schema downloaded successfully!');
        } catch (error) {
            console.error('Failed to download schema:', error);
            if (error instanceof Error && error.message.includes('Schema validation failed')) {
                toast.error('Validation Error', {
                    description: error.message
                });
            } else {
                toast.error('Failed to download schema');
            }
        }
    };

    const executePrismaCommand = async (command: string, commandType: 'generate' | 'push' | 'migrate' | 'pull') => {
        if (!project) return;

        setPrismaCommands(prev => ({ ...prev, [commandType === 'migrate' ? 'isMigrating' : `is${commandType.charAt(0).toUpperCase() + commandType.slice(1)}ing`]: true, output: '', error: '' }));

        try {
            await handleSave();

            const response = await executeCommandMutation.mutateAsync({
                project_id: project.id,
                command,
                schema: generateSchema(),
                database_url: project.database_url || 'env("DATABASE_URL")'
            });

            let outputMessage = response.output || 'Command executed successfully!';

            if (response.migration_files && response.migration_files.length > 0) {
                outputMessage += '\n\n📁 Migration Files Created/Updated:\n';
                response.migration_files.forEach((file: any) => {
                    outputMessage += `• ${file.name}\n`;
                });
            }

            setPrismaCommands(prev => ({ ...prev, output: outputMessage }));
            if (commandType === 'pull') {
                window.location.reload();
            }
        } catch (error: any) {
            let errorMessage = `Failed to execute ${command}`;

            if (error?.response?.data) {
                const errorData = error.response.data;
                if (typeof errorData === 'string') {
                    errorMessage = errorData;
                } else if (errorData.error) {
                    errorMessage = errorData.error;
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                } else {
                    errorMessage = JSON.stringify(errorData);
                }
            } else if (error?.message) {
                errorMessage = error.message;
            }

            setPrismaCommands(prev => ({ ...prev, error: errorMessage }));
        } finally {
            setPrismaCommands(prev => ({ ...prev, [commandType === 'migrate' ? 'isMigrating' : `is${commandType.charAt(0).toUpperCase() + commandType.slice(1)}ing`]: false }));
        }
    };

    const handlePrismaGenerate = () => executePrismaCommand('prisma generate', 'generate');
    const handlePrismaDbPush = () => executePrismaCommand('prisma db push', 'push');
    const handlePrismaMigrateDev = () => executePrismaCommand('prisma migrate dev --name auto-migration', 'migrate');
    const handlePrismaDbPull = () => executePrismaCommand('prisma db pull', 'pull');

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex items-center gap-3 text-muted-foreground">
                    <Loader2 className="animate-spin" size={24} />
                    <span>Loading project...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Failed to load project</p>
                    <Button onClick={() => navigate({ to: '/dashboard' })}>
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    if (!project) return <div>Loading...</div>;

    return (
        <div className="h-screen flex flex-col">
            <header className="bg-white border-b border-gray-200 p-2 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                    <Button onClick={() => navigate({ to: '/dashboard' })} variant="ghost" size="sm">
                        <ArrowLeft size={20} />
                    </Button>
                    <h1 className="text-lg sm:text-xl font-bold truncate">{project.name}</h1>
                </div>
                <div className="flex flex-wrap gap-1 sm:gap-2 w-full sm:w-auto justify-end">
                    <Button onClick={handleSave} className="flex items-center gap-1 sm:gap-2 text-sm" size="sm">
                        <Save size={16} />
                        <span className="hidden sm:inline">Save</span>
                    </Button>
                    <Separator className="h-6 hidden sm:block" />

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="flex items-center gap-1 sm:gap-2 text-sm" size="sm">
                                <Database size={16} />
                                <span className="hidden sm:inline">Prisma CLI</span>
                                <span className="sm:hidden">CLI</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                            <DialogHeader className="shrink-0">
                                <DialogTitle>Prisma CLI Commands</DialogTitle>
                                <DialogDescription>
                                    Execute Prisma commands for your database schema management
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 overflow-y-auto flex-1 pr-2">
                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        onClick={handlePrismaGenerate}
                                        disabled={prismaCommands.isGenerating}
                                        className="flex items-center gap-2"
                                    >
                                        <Play size={16} />
                                        {prismaCommands.isGenerating ? 'Generating...' : 'Generate Client'}
                                    </Button>

                                    <Button
                                        onClick={handlePrismaDbPush}
                                        disabled={prismaCommands.isPushing}
                                        variant="secondary"
                                        className="flex items-center gap-2"
                                    >
                                        <Upload size={16} />
                                        {prismaCommands.isPushing ? 'Pushing...' : 'DB Push'}
                                    </Button>

                                    <Button
                                        onClick={handlePrismaMigrateDev}
                                        disabled={prismaCommands.isMigrating}
                                        variant="secondary"
                                        className="flex items-center gap-2"
                                    >
                                        <GitBranch size={16} />
                                        {prismaCommands.isMigrating ? 'Migrating...' : 'Migrate Dev'}
                                    </Button>

                                    <Button
                                        onClick={handlePrismaDbPull}
                                        disabled={prismaCommands.isPulling}
                                        variant="outline"
                                        className="flex items-center gap-2"
                                    >
                                        <RefreshCw size={16} />
                                        {prismaCommands.isPulling ? 'Pulling...' : 'DB Pull'}
                                    </Button>
                                </div>

                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Badge>Generate</Badge>
                                        <span>Generate Prisma Client from schema</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge>DB Push</Badge>
                                        <span>Push schema changes directly to database</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge>Migrate Dev</Badge>
                                        <span>Create and apply migration files</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge>DB Pull</Badge>
                                        <span>Pull database schema to Prisma schema</span>
                                    </div>
                                </div>

                                {(prismaCommands.output || prismaCommands.error) && (
                                    <div className="mt-4 space-y-3">
                                        {prismaCommands.output && (
                                            <div>
                                                <h4 className="font-semibold text-sm mb-2">Output:</h4>
                                                <Alert className="max-h-64 overflow-y-auto">
                                                    <AlertDescription className="font-mono text-sm whitespace-pre-wrap wrap-break-word">
                                                        {prismaCommands.output}
                                                    </AlertDescription>
                                                </Alert>
                                            </div>
                                        )}
                                        {prismaCommands.error && (
                                            <div>
                                                <h4 className="font-semibold text-sm mb-2 text-red-600">Error:</h4>
                                                <Alert variant="destructive" className="max-h-64 overflow-y-auto">
                                                    <AlertDescription className="font-mono text-sm whitespace-pre-wrap wrap-break-word">
                                                        {typeof prismaCommands.error === 'string'
                                                            ? prismaCommands.error
                                                            : JSON.stringify(prismaCommands.error, null, 2)}
                                                    </AlertDescription>
                                                </Alert>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Button
                        onClick={handleDownloadSchema}
                        variant="outline"
                        className="flex items-center gap-1 sm:gap-2 text-sm"
                        size="sm"
                        title="Download Prisma Schema"
                    >
                        <Download size={16} />
                        <span className="hidden sm:inline">Download</span>
                    </Button>
                </div>
            </header>

            <div className="flex-1 flex flex-col lg:flex-row">
                <aside className="w-full lg:w-64 bg-gray-50 border-r border-gray-200 p-2 sm:p-4 overflow-y-auto lg:max-h-none max-h-40 lg:block">
                    <div className="space-y-2 sm:space-y-4">
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-1 sm:mb-2 flex items-center gap-2 text-sm sm:text-base">
                                <Boxes size={14} className="sm:w-4 sm:h-4" />
                                Components
                            </h3>
                            <div
                                className="bg-white p-2 sm:p-3 rounded-lg border border-gray-200 cursor-move shadow-sm hover:shadow-md transition-shadow mb-2 flex items-center gap-2"
                                draggable
                                onDragStart={(event) => event.dataTransfer.setData('application/reactflow', 'Model')}
                            >
                                <Database size={14} className="text-blue-600 sm:w-4 sm:h-4" />
                                <span className="font-medium text-sm sm:text-base">Model</span>
                            </div>

                            <div
                                className="bg-white p-2 sm:p-3 rounded-lg border border-gray-200 cursor-move shadow-sm hover:shadow-md transition-shadow mb-2 flex items-center gap-2"
                                draggable
                                onDragStart={(event) => event.dataTransfer.setData('application/reactflow', 'Enum')}
                            >
                                <Badge size={14} className="text-purple-600 sm:w-4 sm:h-4" />
                                <span className="font-medium text-sm sm:text-base">Enum</span>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-800 mb-1 sm:mb-2 text-sm sm:text-base">
                                Models ({nodes.length})
                            </h3>
                            <div className="space-y-1 max-h-32 lg:max-h-none overflow-y-auto">
                                {nodes.map((node) => (
                                    <button
                                        key={node.id}
                                        onClick={() => setSelectedNode(node)}
                                        className={`w-full text-left p-1.5 sm:p-2 rounded text-xs sm:text-sm transition-colors ${selectedNode?.id === node.id
                                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                            : 'hover:bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        <div className="flex items-center gap-1.5 sm:gap-2">
                                            <Database size={10} className="sm:w-3 sm:h-3" />
                                            <span className="truncate">{node.data.label}</span>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-0.5 sm:mt-1">
                                            {node.data.fields?.length || 0} fields
                                        </div>
                                    </button>
                                ))}
                                {nodes.length === 0 && (
                                    <div className="text-center py-4 text-gray-500 text-sm">
                                        <Database size={24} className="mx-auto mb-2 opacity-50" />
                                        <p>No models yet</p>
                                        <p className="text-xs">Drag a model from above</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-800 mb-2">Relations</h3>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p>• Drag from model handles to create relations</p>
                                <p>• Click edges to edit relation type</p>
                            </div>
                        </div>
                    </div>
                </aside>

                <div className="flex-1 h-full min-h-[400px] lg:min-h-0" ref={reactFlowWrapper}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onInit={setReactFlowInstance}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onNodeClick={onNodeClick}
                        onEdgeClick={onEdgeClick}
                        onPaneClick={onPaneClick}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        nodesDraggable={true}
                        nodesConnectable={true}
                        elementsSelectable={true}
                        fitView
                        deleteKeyCode={['Backspace', 'Delete']}
                        multiSelectionKeyCode={['Meta', 'Ctrl']}
                    >
                        <Background />
                        <Controls />
                        <MiniMap />
                    </ReactFlow>
                </div>

                <aside className="w-full lg:w-80 bg-gray-50 border-l border-gray-200 overflow-y-auto lg:max-h-none max-h-60">
                    <PropertiesPanel
                        key={selectedNode?.id || selectedEdge?.id || 'empty'}
                        node={selectedNode || null}
                        edge={selectedEdge || null}
                        setNodes={setNodes}
                        databaseProvider={(project?.database_provider?.toUpperCase() || 'POSTGRESQL') as DatabaseProvider}
                        project={project}
                        nodes={nodes}
                        onDownloadSchema={handleDownloadSchema}
                        onDeleteEdge={deleteSelectedEdge}
                        onDeleteNode={deleteNode}
                        onUpdateEdgeRelationType={updateEdgeRelationType}
                        onUpdateEdgeProperty={updateEdgeProperty}
                        onUpdateProject={updateProject}
                        onDeleteProject={deleteProject}
                        validateName={validateName}
                    />
                </aside>
            </div>
        </div>
    );
}

export default Editor