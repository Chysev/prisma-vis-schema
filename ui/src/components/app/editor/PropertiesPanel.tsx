import {
    PRISMA_SCALAR_TYPES, NATIVE_TYPE_MAP,
    type PrismaField, type PrismaScalarType, type DatabaseProvider,
} from '@/types/app.types';
import React, { useState } from 'react';
import type { Node, Edge } from 'reactflow';
import { Plus, Trash2, Settings, Download, ArrowRight } from 'lucide-react';

type PropertiesPanelProps = {
    node: Node | null;
    edge: Edge | null;
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
    databaseProvider: DatabaseProvider;
    project?: any;
    nodes?: Node[];
    onDownloadSchema: () => void;
    onDeleteEdge: () => void;
    onUpdateEdgeRelationType: (relationType: string) => void;
    onUpdateEdgeProperty?: (property: string, value: any) => void;
    onUpdateProject?: (updates: any) => void;
    onDeleteProject?: () => void;
    onDeleteNode?: (nodeId: string) => void;
    validateName?: (name: string, nodeId: string, nodeType: 'model' | 'enum') => boolean;
}

export const PropertiesPanel = ({
    node,
    edge,
    setNodes,
    databaseProvider,
    project,
    nodes = [],
    onDownloadSchema,
    onDeleteEdge,
    onUpdateEdgeRelationType,
    onUpdateEdgeProperty,
    onUpdateProject,
    onDeleteProject,
    onDeleteNode,
    validateName
}: PropertiesPanelProps) => {
    const [activeTab, setActiveTab] = useState<'fields' | 'attributes' | 'relation'>('fields');

    if (edge) {
        return <RelationPropertiesPanel edge={edge} onDelete={onDeleteEdge} onUpdateRelationType={onUpdateEdgeRelationType} onUpdateEdgeProperty={onUpdateEdgeProperty} onDownloadSchema={onDownloadSchema} />;
    }

    if (!node) {
        return <ProjectSettingsPanel project={project} onDownloadSchema={onDownloadSchema} onUpdateProject={onUpdateProject} onDeleteProject={onDeleteProject} />;
    }

    const availableEnums = nodes.filter(n => n.type === 'enum').map(n => n.data.label);

    const handleNameChange = (newName: string) => {
        if (validateName && node) {
            const nodeType = node.type as 'model' | 'enum';
            if (!validateName(newName, node.id, nodeType)) {
                return;
            }
        }

        setNodes((nds: Node[]) =>
            nds.map((n) => {
                if (n.id === node.id) {
                    return { ...n, data: { ...n.data, label: newName } };
                }
                return n;
            })
        );
    };

    const addField = () => {
        const newField: Partial<PrismaField> = {
            id: `field-${Date.now()}`,
            name: 'newField',
            type: 'String',
            isOptional: false,
            isArray: false,
            isId: false,
            isUnique: false,
            isUpdatedAt: false
        };

        setNodes((nds: Node[]) =>
            nds.map((n) => {
                if (n.id === node.id) {
                    return {
                        ...n,
                        data: {
                            ...n.data,
                            fields: [...(n.data.fields || []), newField]
                        }
                    };
                }
                return n;
            })
        );
    };

    const updateField = (fieldIndex: number, updates: Partial<PrismaField>) => {
        setNodes((nds: Node[]) =>
            nds.map((n) => {
                if (n.id === node.id) {
                    const newFields = [...(n.data.fields || [])];
                    newFields[fieldIndex] = { ...newFields[fieldIndex], ...updates };
                    return {
                        ...n,
                        data: {
                            ...n.data,
                            fields: newFields
                        }
                    };
                }
                return n;
            })
        );
    };

    const deleteField = (fieldIndex: number) => {
        setNodes((nds: Node[]) =>
            nds.map((n) => {
                if (n.id === node.id) {
                    const newFields = [...(n.data.fields || [])];
                    newFields.splice(fieldIndex, 1);
                    return {
                        ...n,
                        data: {
                            ...n.data,
                            fields: newFields
                        }
                    };
                }
                return n;
            })
        );
    };

    const handleDeleteNode = () => {
        if (node && onDeleteNode) {
            onDeleteNode(node.id);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-semibold text-gray-800">
                        {node.type === 'enum' ? 'Enum Properties' : 'Model Properties'}
                    </h3>
                    <button
                        onClick={handleDeleteNode}
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                        title={`Delete ${node.type === 'enum' ? 'Enum' : 'Model'}`}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
                <p className="text-sm text-gray-500">{node.data.label}</p>
            </div>

            {node.type !== 'enum' && (
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('fields')}
                        className={`flex-1 py-2 px-4 text-sm font-medium ${activeTab === 'fields'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Fields
                    </button>
                    <button
                        onClick={() => setActiveTab('attributes')}
                        className={`flex-1 py-2 px-4 text-sm font-medium ${activeTab === 'attributes'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Attributes
                    </button>
                </div>
            )}

            <div className="flex-1 overflow-y-auto">
                <div className="p-4">
                    {node.type === 'enum' ? (
                        <EnumTab
                            node={node}
                            onNameChange={handleNameChange}
                            setNodes={setNodes}
                            validateName={validateName}
                        />
                    ) : activeTab === 'fields' ? (
                        <FieldsTab
                            node={node}
                            onNameChange={handleNameChange}
                            onAddField={addField}
                            onUpdateField={updateField}
                            onDeleteField={deleteField}
                            databaseProvider={databaseProvider}
                            availableEnums={availableEnums}
                            validateName={validateName}
                        />
                    ) : (
                        <AttributesTab
                            node={node}
                            setNodes={setNodes}
                        />
                    )}
                </div>
            </div>

            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={onDownloadSchema}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                    <Download size={16} />
                    Download Schema
                </button>
            </div>
        </div>
    );
}

type FieldsTabProps = {
    node: Node;
    onNameChange: (name: string) => void;
    onAddField: () => void;
    onUpdateField: (index: number, updates: Partial<PrismaField>) => void;
    onDeleteField: (index: number) => void;
    databaseProvider: DatabaseProvider;
    availableEnums: string[];
    validateName?: (name: string, nodeId: string, nodeType: 'model' | 'enum') => boolean;
}

const FieldsTab = ({
    node,
    onNameChange,
    onAddField,
    onUpdateField,
    onDeleteField,
    databaseProvider,
    availableEnums,
    validateName
}: FieldsTabProps) => {
    const nativeTypes = NATIVE_TYPE_MAP[databaseProvider] || [];

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model Name
                </label>
                <input
                    type="text"
                    value={node.data.label || ''}
                    onChange={(e) => onNameChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ModelName"
                />
            </div>

            <div>
                <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-medium text-gray-700">
                        Fields ({node.data.fields?.length || 0})
                    </label>
                    <button
                        onClick={onAddField}
                        className="flex items-center gap-1 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition"
                    >
                        <Plus size={12} />
                        Add Field
                    </button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {node.data.fields && node.data.fields.length > 0 ? (
                        node.data.fields.map((field: PrismaField, index: number) => (
                            <FieldEditor
                                key={field.id || index}
                                field={field}
                                index={index}
                                onUpdate={onUpdateField}
                                onDelete={onDeleteField}
                                nativeTypes={nativeTypes}
                                availableEnums={availableEnums}
                            />
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <Plus size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No fields yet</p>
                            <button
                                onClick={onAddField}
                                className="text-blue-600 hover:text-blue-700 text-sm mt-1"
                            >
                                Add your first field
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

type FieldEditorProps = {
    field: PrismaField;
    index: number;
    onUpdate: (index: number, updates: Partial<PrismaField>) => void;
    onDelete: (index: number) => void;
    nativeTypes: string[];
    availableEnums: string[];
}

const FieldEditor = ({ field, index, onUpdate, onDelete, nativeTypes, availableEnums }: FieldEditorProps) => {
    return (
        <div className="border border-gray-200 rounded-lg p-3 space-y-3 bg-white">
            <div className="flex items-center justify-between">
                <div className="flex-1 grid grid-cols-2 gap-2">
                    <input
                        type="text"
                        value={field.name || ''}
                        onChange={(e) => onUpdate(index, { name: e.target.value })}
                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="fieldName"
                    />

                    <select
                        value={field.type || 'String'}
                        onChange={(e) => onUpdate(index, { type: e.target.value })}
                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <optgroup label="Scalar Types">
                            {PRISMA_SCALAR_TYPES.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </optgroup>
                        {availableEnums.length > 0 && (
                            <optgroup label="Enum Types">
                                {availableEnums.map(enumName => (
                                    <option key={enumName} value={enumName}>{enumName}</option>
                                ))}
                            </optgroup>
                        )}
                    </select>
                </div>

                <button
                    onClick={() => onDelete(index)}
                    className="ml-2 text-red-500 hover:text-red-700 p-1"
                >
                    <Trash2 size={14} />
                </button>
            </div>

            <div className="flex flex-wrap gap-2">
                <label className="flex items-center text-xs">
                    <input
                        type="checkbox"
                        checked={field.isOptional || false}
                        onChange={(e) => onUpdate(index, { isOptional: e.target.checked })}
                        className="mr-1"
                    />
                    Optional ?
                </label>
                <label className="flex items-center text-xs">
                    <input
                        type="checkbox"
                        checked={field.isArray || false}
                        onChange={(e) => onUpdate(index, { isArray: e.target.checked })}
                        className="mr-1"
                    />
                    Array []
                </label>
                <label className="flex items-center text-xs">
                    <input
                        type="checkbox"
                        checked={field.isId || false}
                        onChange={(e) => onUpdate(index, { isId: e.target.checked })}
                        className="mr-1"
                    />
                    @id
                </label>
                <label className="flex items-center text-xs">
                    <input
                        type="checkbox"
                        checked={field.isUnique || false}
                        onChange={(e) => onUpdate(index, { isUnique: e.target.checked })}
                        className="mr-1"
                    />
                    @unique
                </label>
            </div>

            <div>
                <input
                    type="text"
                    value={field.defaultValue || ''}
                    onChange={(e) => onUpdate(index, { defaultValue: e.target.value })}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Default value (e.g., autoincrement(), uuid(), 'default')"
                />
            </div>

            {nativeTypes.length > 0 && (
                <div>
                    <select
                        value={field.nativeType?.type || ''}
                        onChange={(e) => {
                            const nativeType = e.target.value ? { type: e.target.value } : undefined;
                            onUpdate(index, { nativeType });
                        }}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="">No native type</option>
                        {nativeTypes.map(type => (
                            <option key={type} value={type}>@db.{type}</option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
};

type AttributesTabProps = {
    node: Node;
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
}

const AttributesTab = ({ }: AttributesTabProps) => {
    return (
        <div className="space-y-4">
            <div className="text-sm text-gray-500">
                Model-level attributes and configurations will be added here in future updates.
            </div>

            <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Coming Soon:</h4>
                <ul className="text-xs text-gray-500 space-y-1 ml-4">
                    <li>• @@id (Composite primary keys)</li>
                    <li>• @@unique (Composite unique constraints)</li>
                    <li>• @@index (Database indexes)</li>
                    <li>• @@fulltext (Full-text search)</li>
                    <li>• @@map (Custom table names)</li>
                    <li>• @@schema (PostgreSQL schemas)</li>
                </ul>
            </div>
        </div>
    );
};

type RelationPropertiesPanelProps = {
    edge: Edge;
    onDelete: () => void;
    onUpdateRelationType: (relationType: string) => void;
    onUpdateEdgeProperty?: (property: string, value: any) => void;
    onDownloadSchema: () => void;
}

const RelationPropertiesPanel = ({ edge, onDelete, onUpdateRelationType, onUpdateEdgeProperty, onDownloadSchema }: RelationPropertiesPanelProps) => {
    const currentRelationType = edge.data?.relationType || 'ONE_TO_MANY';
    const isOptional = edge.data?.isOptional ?? true;

    const relationTypes = [
        { value: 'ONE_TO_ONE', label: '1:1 - One to One', description: 'Each record relates to exactly one record' },
        { value: 'ONE_TO_MANY', label: '1:N - One to Many', description: 'One record relates to many records' },
        { value: 'MANY_TO_MANY', label: 'N:M - Many to Many', description: 'Many records relate to many records' },
    ];

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Relation Properties</h3>
                <p className="text-sm text-gray-500">Configure the relationship type</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Relation Type
                    </label>
                    <div className="space-y-2">
                        {relationTypes.map(({ value, label, description }) => (
                            <button
                                key={value}
                                onClick={() => onUpdateRelationType(value)}
                                className={`w-full text-left p-3 rounded-lg border transition-all ${currentRelationType === value
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                <div className="font-medium">{label}</div>
                                <div className="text-xs text-gray-500 mt-1">{description}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {(currentRelationType === 'ONE_TO_ONE' || currentRelationType === 'ONE_TO_MANY') && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Relation Options
                        </label>
                        <div className="bg-gray-50 p-3 rounded space-y-2">
                            <label className="flex items-center text-sm">
                                <input
                                    type="checkbox"
                                    checked={isOptional}
                                    onChange={(e) => onUpdateEdgeProperty?.('isOptional', e.target.checked)}
                                    className="mr-2"
                                />
                                <span>Optional Relation</span>
                                <span className="ml-2 text-xs text-gray-500">(?)</span>
                            </label>
                            <p className="text-xs text-gray-500">
                                Optional relations allow records to be created without requiring the related record to exist.
                            </p>
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Connection Info
                    </label>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                            <span className="font-mono">{edge.source}</span>
                            <ArrowRight size={14} />
                            <span className="font-mono">{edge.target}</span>
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        onClick={onDelete}
                        className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                    >
                        <Trash2 size={16} />
                        Delete Relation
                    </button>
                </div>
            </div>

            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={onDownloadSchema}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                    <Download size={16} />
                    Download Schema
                </button>
            </div>
        </div>
    );
};

type ProjectSettingsPanelProps = {
    project?: any;
    onDownloadSchema: () => void;
    onUpdateProject?: (updates: any) => void;
    onDeleteProject?: () => void;
}

type EnumTabProps = {
    node: Node;
    onNameChange: (name: string) => void;
    setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
    validateName?: (name: string, nodeId: string, nodeType: 'model' | 'enum') => boolean;
}

const EnumTab = ({ node, onNameChange, setNodes, validateName }: EnumTabProps) => {
    const addValue = () => {
        setNodes((nds: Node[]) =>
            nds.map((n) => {
                if (n.id === node.id) {
                    const newValues = [...(n.data.values || []), 'NEW_VALUE'];
                    return {
                        ...n,
                        data: {
                            ...n.data,
                            values: newValues
                        }
                    };
                }
                return n;
            })
        );
    };

    const updateValue = (index: number, newValue: string) => {
        setNodes((nds: Node[]) =>
            nds.map((n) => {
                if (n.id === node.id) {
                    const newValues = [...(n.data.values || [])];
                    newValues[index] = newValue;
                    return {
                        ...n,
                        data: {
                            ...n.data,
                            values: newValues
                        }
                    };
                }
                return n;
            })
        );
    };

    const deleteValue = (index: number) => {
        setNodes((nds: Node[]) =>
            nds.map((n) => {
                if (n.id === node.id) {
                    const newValues = [...(n.data.values || [])];
                    newValues.splice(index, 1);
                    return {
                        ...n,
                        data: {
                            ...n.data,
                            values: newValues
                        }
                    };
                }
                return n;
            })
        );
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enum Name
                </label>
                <input
                    type="text"
                    value={node.data.label || ''}
                    onChange={(e) => onNameChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="EnumName"
                />
            </div>

            <div>
                <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-medium text-gray-700">
                        Values ({node.data.values?.length || 0})
                    </label>
                    <button
                        onClick={addValue}
                        className="flex items-center gap-1 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition"
                    >
                        <Plus size={12} />
                        Add Value
                    </button>
                </div>

                <div className="space-y-2">
                    {node.data.values && node.data.values.length > 0 ? (
                        node.data.values.map((value: string, index: number) => (
                            <div key={index} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={value}
                                    onChange={(e) => updateValue(index, e.target.value)}
                                    className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="VALUE_NAME"
                                />
                                <button
                                    onClick={() => deleteValue(index)}
                                    className="text-red-500 hover:text-red-700 p-1"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <Plus size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No enum values yet</p>
                            <button
                                onClick={addValue}
                                className="text-blue-600 hover:text-blue-700 text-sm mt-1"
                            >
                                Add your first value
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ProjectSettingsPanel = ({ project, onDownloadSchema, onUpdateProject, onDeleteProject }: ProjectSettingsPanelProps) => {
    if (!project) {
        return (
            <div className="p-4">
                <div className="text-center mb-6">
                    <Settings size={48} className="mx-auto text-gray-300 mb-3" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No Project</h3>
                    <p className="text-sm text-gray-500">
                        Loading project settings...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Project Settings</h3>
                <p className="text-sm text-gray-500">Configure project details and database</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project Name
                    </label>
                    <input
                        type="text"
                        value={project.name || ''}
                        onChange={(e) => onUpdateProject?.({ name: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter project name"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Database Provider
                    </label>
                    <select
                        value={project.database_provider || 'POSTGRESQL'}
                        onChange={(e) => onUpdateProject?.({ database_provider: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="MYSQL">MySQL</option>
                        <option value="POSTGRESQL">PostgreSQL</option>
                        <option value="SQLITE">SQLite</option>
                        <option value="SQLSERVER">SQL Server</option>
                        <option value="MONGODB">MongoDB</option>
                        <option value="COCKROACHDB">CockroachDB</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Database URL
                    </label>
                    <input
                        type="text"
                        value={project.database_url || ''}
                        onChange={(e) => onUpdateProject?.({ database_url: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="mysql://user:password@localhost:3306/database"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Enter your database connection string
                    </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Project Information</h4>
                    <div className="space-y-1 text-xs text-gray-600">
                        <div><span className="font-medium">ID:</span> {project.id}</div>
                        <div><span className="font-medium">Created:</span> {new Date(project.created_at).toLocaleDateString()}</div>
                        <div><span className="font-medium">Updated:</span> {new Date(project.updated_at).toLocaleDateString()}</div>
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-gray-200 space-y-2">
                <button
                    onClick={onDownloadSchema}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                    <Download size={16} />
                    Download Schema
                </button>

                {onDeleteProject && (
                    <button
                        onClick={() => {
                            if (window.confirm(`Are you sure you want to delete "${project?.name}"? This action cannot be undone.`)) {
                                onDeleteProject();
                            }
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                    >
                        <Trash2 size={16} />
                        Delete Project
                    </button>
                )}
            </div>
        </div>
    );
};