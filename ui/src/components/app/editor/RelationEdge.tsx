import { memo } from 'react';
import { Trash2 } from 'lucide-react';
import type { EdgeProps } from 'reactflow';
import { getBezierPath, EdgeLabelRenderer } from 'reactflow';

type RelationEdgeData = {
    relationType?: 'ONE_TO_ONE' | 'ONE_TO_MANY' | 'MANY_TO_MANY';
    onDelete?: 'CASCADE' | 'SET_NULL' | 'RESTRICT' | 'NO_ACTION' | 'SET_DEFAULT';
    isOptional?: boolean;
    isEnumType?: boolean;
    fieldName?: string;
    enumName?: string;
}

const RelationEdge = memo(({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    selected
}: EdgeProps<RelationEdgeData>) => {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const getRelationSymbol = () => {
        if (data?.isEnumType) {
            return `${data.fieldName}: ${data.enumName}`;
        }

        const baseSymbol = (() => {
            switch (data?.relationType) {
                case 'ONE_TO_ONE':
                    return '1:1';
                case 'ONE_TO_MANY':
                    return '1:N';
                case 'MANY_TO_MANY':
                    return 'N:M';
                default:
                    return '1:N';
            }
        })();

        return data?.isOptional ? `${baseSymbol}?` : baseSymbol;
    };

    const getStrokeColor = () => {
        if (data?.isEnumType) {
            return '#8B5CF6';
        }

        switch (data?.relationType) {
            case 'ONE_TO_ONE':
                return '#10B981';
            case 'ONE_TO_MANY':
                return '#3B82F6';
            case 'MANY_TO_MANY':
                return '#8B5CF6';
            default:
                return '#6B7280';
        }
    };

    return (
        <>
            <svg>
                <defs>
                    <marker
                        id={`arrowhead-${id}`}
                        markerWidth="10"
                        markerHeight="7"
                        refX="9"
                        refY="3.5"
                        orient="auto"
                        markerUnits="strokeWidth"
                    >
                        <polygon
                            points="0 0, 10 3.5, 0 7"
                            fill={getStrokeColor()}
                        />
                    </marker>
                </defs>
            </svg>
            <path
                id={id}
                className="react-flow__edge-path"
                d={edgePath}
                strokeWidth={selected ? 3 : 2}
                stroke={getStrokeColor()}
                strokeDasharray={data?.isEnumType || data?.isOptional ? "5,5" : "none"}
                fill="none"
                markerEnd={`url(#arrowhead-${id})`}
            />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        pointerEvents: 'all',
                    }}
                    className="nodrag nopan"
                >
                    <div className={`flex items-center gap-1 bg-white border rounded px-2 py-1 shadow-sm text-xs font-medium transition-all ${selected ? (data?.isEnumType ? 'border-purple-500 shadow-md' : 'border-blue-500 shadow-md') : 'border-gray-200'
                        } ${data?.isOptional || data?.isEnumType ? 'border-dashed' : ''}`}>
                        <span style={{ color: getStrokeColor() }}>
                            {getRelationSymbol()}
                        </span>
                        {data?.isEnumType && (
                            <span className="text-purple-500 text-xs font-bold" title="Enum field type">
                                E
                            </span>
                        )}
                        {data?.isOptional && !data?.isEnumType && (
                            <span className="text-orange-500 text-xs font-bold" title="Optional relation">
                                ?
                            </span>
                        )}
                        {selected && !data?.isEnumType && (
                            <button
                                className="text-red-500 hover:text-red-700 ml-1"
                                onClick={() => {
                                    console.log('Delete edge:', id);
                                }}
                            >
                                <Trash2 size={12} />
                            </button>
                        )}
                    </div>
                </div>
            </EdgeLabelRenderer>
        </>
    );
});

RelationEdge.displayName = 'RelationEdge';

export default RelationEdge;