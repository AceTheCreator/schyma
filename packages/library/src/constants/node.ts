import { Edge, MarkerType } from 'reactflow'
import { CompositionType } from '../types'

export const nodeWidth = 172
export const nodeHeight = 36

export const position = { x: 0, y: 0, zoom: 0.2 }

export const initialEdges: [Edge] = [
  {
    id: 'edges-e5-7',
    source: '0',
    target: '1',
    label: '+',
    labelBgPadding: [8, 4],
    labelBgBorderRadius: 4,
    animated: true,
    type: 'smart',
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
]

export const compositionEdgeColors: Record<CompositionType, string> = {
  [CompositionType.OneOf]: '#f59e0b',
  [CompositionType.AnyOf]: '#8b5cf6',
  [CompositionType.AllOf]: '',
  [CompositionType.Not]: '#ef4444',
}
