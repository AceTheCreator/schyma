import React from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { CompositionType, NodeData } from '../types'
import { compositionEdgeColors } from '../constants/node'

const compositionSymbols: Record<CompositionType, string> = {
  [CompositionType.OneOf]: '⊕',
  [CompositionType.AnyOf]: '⊛',
  [CompositionType.AllOf]: '',
  [CompositionType.Not]: '⊘',
}

const SchemaNode: React.FC<NodeProps<NodeData>> = ({ data }) => {
  const { label, compositionType, isRoot } = data
  const symbol = compositionType ? compositionSymbols[compositionType] : null
  const symbolColor = compositionType ? compositionEdgeColors[compositionType] : undefined

  return (
    <div className='custom-node'>
      {!isRoot && <Handle type='target' position={Position.Left} />}

      <span className='custom-node-label'>{label}</span>

      {symbol && (
        <span className='composition-symbol' style={{ color: symbolColor }} title={compositionType || undefined}>
          {symbol}
        </span>
      )}

      <Handle type='source' position={Position.Right} style={{ background: symbolColor || undefined }} />
    </div>
  )
}

export default SchemaNode
