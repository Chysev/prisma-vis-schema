import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { MoreVertical, Hash } from 'lucide-react';

interface EnumNodeData {
    label: string;
    values: string[];
    isSelected?: boolean;
}

const EnumNode = ({ data, selected }: NodeProps<EnumNodeData>) => {
    return (
        <div className={`bg-white rounded-lg shadow-lg border-2 min-w-[200px] max-w-[280px] overflow-hidden transition-all ${selected ? 'border-purple-500 shadow-xl' : 'border-gray-200'
            }`}>
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Hash size={16} className="text-white" />
                    <span className="font-bold text-lg">{data.label}</span>
                </div>
                <MoreVertical size={16} className="cursor-pointer opacity-70 hover:opacity-100" />
            </div>

            <div className="divide-y divide-gray-100">
                {data.values && data.values.length > 0 ? (
                    data.values.map((value: string, index: number) => (
                        <div key={index} className="p-2 hover:bg-gray-50 transition-colors relative group">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                <span className="font-medium text-gray-800 font-mono text-sm">
                                    {value}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-4 text-center text-gray-400 text-sm italic">
                        No values defined
                    </div>
                )}
            </div>

            <Handle
                type="source"
                position={Position.Right}
                id="enum-source"
                className="!bg-purple-400 !border-2 !border-white !w-3 !h-3 !right-[-6px] !top-[50%]"
            />
            <Handle
                type="target"
                position={Position.Left}
                id="enum-target"
                className="!bg-purple-400 !border-2 !border-white !w-3 !h-3 !left-[-6px] !top-[50%]"
            />
        </div>
    );
};

export default memo(EnumNode);