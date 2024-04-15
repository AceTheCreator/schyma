import React from 'react';
import { Node } from 'reactflow';
import { NodeType } from '../types';


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
                    {nodes.map((node: Node) => {
                        return <tr key={node.data.id} className={`panel_table-wrapper_tbody ${active?.data.label === node.data.label ? "panel_table-wrapper_tbody_active" : ""}`}>
                            <th scope="">
                                {node.data.label}
                            </th>
                            <td>
                                {node.data.description}
                            </td>
                        </tr>
                    })}
        </tbody>
    </table>
</div>

  )
}

export default Tables