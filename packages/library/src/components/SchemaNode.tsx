import React from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { CompositionType, NodeData } from '../types'

// Symbols for different composition types
const compositionSymbols: Record<CompositionType, string> = {
  [CompositionType.OneOf]: '⊕',
  [CompositionType.AnyOf]: '⊛',
  [CompositionType.AllOf]: '',
  [CompositionType.Not]: '⊘',
}

// Colors matching the edge colors
const compositionColors: Record<CompositionType, string> = {
  [CompositionType.OneOf]: '#f59e0b', // orange
  [CompositionType.AnyOf]: '#8b5cf6', // purple
  [CompositionType.AllOf]: '',
  [CompositionType.Not]: '#ef4444', // red
}

const SchemaNode: React.FC<NodeProps<NodeData>> = ({ data }) => {
  const { label, compositionType, isRoot } = data
  const symbol = compositionType ? compositionSymbols[compositionType] : null
  const symbolColor = compositionType ? compositionColors[compositionType] : undefined

  return (
    <div className='schema-node'>
      {/* Only show target handle for non-root nodes */}
      {!isRoot && <Handle type='target' position={Position.Left} />}

      <span className='schema-node-label'>{label}</span>

      {/* Composition symbol next to label */}
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
