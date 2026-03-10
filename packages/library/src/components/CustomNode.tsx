import React from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { NodeData } from '../types'
import { compositionEdgeColors } from '../constants/node'

const SchemaNode: React.FC<NodeProps<NodeData>> = ({ data }) => {
  const { label, compositionType, isRoot } = data
  const symbolColor = compositionType ? compositionEdgeColors[compositionType] : undefined

  return (
    <div className='custom-node'>
      {!isRoot && <Handle type='target' position={Position.Left} />}

      <span className='custom-node-label'>{label}</span>

      {symbolColor && (
        <>
          <span className='composition-symbol' style={{ color: symbolColor }} aria-hidden='true'></span>
          <span className='composition-tooltip'>{compositionType}</span>
        </>
      )}

      <Handle type='source' position={Position.Right} style={{ background: symbolColor || undefined }} />
    </div>
  )
}

export default SchemaNode
