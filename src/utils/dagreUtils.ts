import { Edge, Node, Position } from 'reactflow'
import { nodeHeight, nodeWidth } from '../constants/node'
import dagre from '@dagrejs/dagre'

export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
  const dagreGraph = new dagre.graphlib.Graph()

  dagreGraph.setDefaultEdgeLabel(() => ({}))
  dagreGraph.setGraph({ rankdir: direction })

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
  })

  edges.forEach((edge: Edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  nodes.forEach((node: Node) => {
    const nodeId = node.id
    const nodeWithPosition = dagreGraph.node(nodeId)
    node.sourcePosition = Position.Right
    node.targetPosition = Position.Left
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 3,
      y: nodeWithPosition.y - nodeHeight / 3,
    }
    return node
  })

  return { nodes, edges }
}
