import React from 'react';
import { Node } from 'reactflow';
import { NodeType } from '../types/nodes';


interface Children {
    nodes: NodeType[],
    active: Node | undefined
}

function Tables({ nodes, active }: Children) {
    return (
        <div className="relative overflow-x-auto mt-10 rounded-md">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="px-6 py-3">
                            Name
                        </th>
                        <th scope="col" className="px-6 py-3">
                            Description
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {nodes.map((node: NodeType) => {
                        return <tr key={node.name} className={`border-b ${active?.id === node.id ? "dark:bg-[#321834]" : "dark:bg-[#1E293B]"} dark:border-gray-700`}>
                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                {node.name}
                            </th>
                            <td className="px-6 py-4">
                                {node.description}
                            </td>
                        </tr>
                    })}
        </tbody>
    </table>
</div>

  )
}

export default Tables