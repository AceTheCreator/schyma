import React from 'react';
import { Node } from 'reactflow';
import { formatRequiredSentence } from '../utils/formatRequired';

interface Children {
    nodes: Node[],
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
                        const nodeRequired = node.data.required as string[] | undefined
                        return <tr key={node.data.id} className={`panel_table-wrapper_tbody ${active?.data.label === node.data.label ? "panel_table-wrapper_tbody_active" : ""}`}>
                            <th scope="">
                                {node.data.label}
                            </th>
                            <td>
                                {node.data.description}
                                {nodeRequired && nodeRequired.length > 0 && (
                                    <p className='required-sentence'>
                                        {formatRequiredSentence(nodeRequired)}
                                    </p>
                                )}
                            </td>
                        </tr>
                    })}
        </tbody>
    </table>
</div>

  )
}

export default Tables