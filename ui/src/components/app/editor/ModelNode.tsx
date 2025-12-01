import React, { memo, useLayoutEffect, useRef } from 'react';
import type { PrismaField } from '@/types/app.types';
import { Handle, Position, type NodeProps } from 'reactflow';
import { MoreVertical, Key, Link, Calendar, Hash } from 'lucide-react';

type ModelNodeData = {
    label: string;
    fields: PrismaField[];
    isSelected?: boolean;
}

const ModelNode = ({ data, selected }: NodeProps<ModelNodeData>) => {
    const nodeRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (nodeRef.current && selected) {
            nodeRef.current.style.zIndex = '1000';
        } else if (nodeRef.current) {
            nodeRef.current.style.zIndex = 'auto';
        }
    }, [selected]);

    const getFieldIcon = (field: PrismaField) => {
        if (field.isId) return <Key size={12} className="text-yellow-600" />;
        if (field.relationName) return <Link size={12} className="text-blue-600" />;
        if (field.type === 'DateTime') return <Calendar size={12} className="text-green-600" />;
        if (field.type === 'Int' || field.type === 'BigInt') return <Hash size={12} className="text-purple-600" />;
        return null;
    };

    const getFieldTypeDisplay = (field: PrismaField) => {
        let typeStr = field.type;
        if (field.isArray) typeStr += '[]';
        if (field.isOptional && !field.isArray) typeStr += '?';
        return typeStr;
    };

    const getFieldAttributes = (field: PrismaField) => {
        const attributes = [];
        if (field.isId) attributes.push('@id');
        if (field.isUnique) attributes.push('@unique');
        if (field.isUpdatedAt) attributes.push('@updatedAt');
        if (field.defaultValue) attributes.push('@default');
        if (field.relationName) attributes.push('@relation');
        return attributes;
    };

    return (
        <div
            ref={nodeRef}
            className={`bg-white rounded-lg shadow-lg border-2 min-w-[240px] max-w-[320px] overflow-hidden transition-all ${selected ? 'border-blue-500 shadow-xl' : 'border-gray-200'
                }`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-white bg-opacity-30 rounded-full"></div>
                    <span className="font-bold text-lg">{data.label}</span>
                </div>
                <MoreVertical size={16} className="cursor-pointer opacity-70 hover:opacity-100" />
            </div>

            {/* Fields */}
            <div className="divide-y divide-gray-100">
                {data.fields && data.fields.length > 0 ? (
                    data.fields.map((field: PrismaField, index: number) => (
                        <div key={field.id || index} className="p-2 hover:bg-gray-50 transition-colors relative group">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        {getFieldIcon(field)}
                                        <span className="font-medium text-gray-800 truncate">
                                            {field.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600 font-mono">
                                            {getFieldTypeDisplay(field)}
                                        </span>
                                        {field.nativeType && (
                                            <span className="text-xs text-purple-600 bg-purple-50 px-1 rounded">
                                                @db.{field.nativeType.type}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Attributes */}
                            <div className="flex flex-wrap gap-1 mt-1">
                                {getFieldAttributes(field).map(attr => (
                                    <span
                                        key={attr}
                                        className={`text-xs px-1 py-0.5 rounded ${attr === '@id' ? 'bg-yellow-100 text-yellow-800' :
                                            attr === '@unique' ? 'bg-blue-100 text-blue-800' :
                                                attr === '@relation' ? 'bg-green-100 text-green-800' :
                                                    attr === '@default' ? 'bg-purple-100 text-purple-800' :
                                                        'bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        {attr}
                                    </span>
                                ))}
                            </div>

                            {/* Connection handles for each field */}
                            <Handle
                                type="source"
                                position={Position.Right}
                                id={`field-${field.id || index}-source`}
                                className="!bg-blue-500 !border-2 !border-white !w-2 !h-2 !right-[-4px]"
                                style={{ top: '50%' }}
                            />
                            <Handle
                                type="target"
                                position={Position.Left}
                                id={`field-${field.id || index}-target`}
                                className="!bg-blue-500 !border-2 !border-white !w-2 !h-2 !left-[-4px]"
                                style={{ top: '50%' }}
                            />
                        </div>
                    ))
                ) : (
                    <div className="p-4 text-center text-gray-400 text-sm italic">
                        No fields defined
                    </div>
                )}
            </div>

            {/* Model-level handles for general connections */}
            <Handle
                type="source"
                position={Position.Right}
                id="model-source"
                className="!bg-gray-400 !border-2 !border-white !w-4 !h-4 !right-[-8px] !top-[50%]"
            />
            <Handle
                type="target"
                position={Position.Left}
                id="model-target"
                className="!bg-gray-400 !border-2 !border-white !w-4 !h-4 !left-[-8px] !top-[50%]"
            />
        </div>
    );
};

export default memo(ModelNode);
