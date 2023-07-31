import React from 'react';
import { Node } from 'reactflow';
import { NodeType } from '../types/nodes';


interface Children {
    nodes: NodeType[],
    active: Node | undefined
}

function Tables({ nodes, active }: Children) {
    return (
        <div className="panel_table-wrapper">
            <table>
                <thead>
                    <tr>
                        <th scope="">
                            Name
                        </th>
                        <th scope="">
                            Description
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {nodes.map((node: NodeType) => {
                        return <tr key={node.name} className={`panel_table-wrapper_tbody ${active?.id === node.id ? "panel_table-wrapper_tbody_active" : ""}`}>
                            <th scope="">
                                {node.name}
                            </th>
                            <td>
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