import React, { useCallback, useEffect, useState, useMemo } from 'react'
import { SmartBezierEdge } from '@tisoap/react-flow-smart-edge'
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useReactFlow,
  MarkerType,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Position,
  ReactFlowProvider,
  Connection,
  ConnectionLineType,
} from 'reactflow'
import {
  getCompositionType,
  propMerge,
  removeEdgesByParent,
  removeElementsByParent,
  resolveRef,
} from '../utils/reusables'
import { JSONSchema7Object } from 'json-schema'
import { CompositionType, IObject, NodeData } from '../types'
import { getLayoutedElements } from '../utils/dagreUtils'
import SchemaNode from './SchemaNode'

type NodeProps = {
  setCurrentNode: (node: Node) => void
  setnNodes: any
  nNodes: { [x: string]: Node }
  initialNode: Node
  schema: JSONSchema7Object
}

const position = { x: 0, y: 0, zoom: 0.2 }
const initialEdges: [Edge] = [
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

// Edge colors for different composition types
const compositionEdgeColors: Record<CompositionType, string> = {
  [CompositionType.OneOf]: '#f59e0b', // orange
  [CompositionType.AnyOf]: '#8b5cf6', // purple
  [CompositionType.AllOf]: '',
  [CompositionType.Not]: '#ef4444', // red
}

// Define node and edge types outside component to prevent re-renders
const edgeTypes = {
  smart: SmartBezierEdge,
}

const nodeTypes = {
  schema: SchemaNode,
}

function Flow({ initialNode, nNodes, setnNodes, setCurrentNode, schema }: NodeProps) {
  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements([initialNode], initialEdges)
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges)
  const [hoveredCompositionNode, setHoveredCompositionNode] = useState<{
    nodeId: string
    compositionType: CompositionType
  } | null>(null)
  const { setCenter } = useReactFlow()

  // Compute styled edges based on hovered composition node
  const styledEdges = useMemo(() => {
    // Skip styling for allOf - all properties are just regular required properties
    if (!hoveredCompositionNode || hoveredCompositionNode.compositionType === CompositionType.AllOf) {
      return edges
    }

    return edges.map((edge) => {
      if (edge.source === hoveredCompositionNode.nodeId) {
        // Find the target node to check if it has a matching compositionSource
        const targetNode = nodes.find((n) => n.id === edge.target)
        const targetCompositionSource = targetNode?.data?.compositionSource as CompositionType | undefined

        // Only color edges to children that came from the composition
        if (targetCompositionSource === hoveredCompositionNode.compositionType) {
          return {
            ...edge,
            style: {
              stroke: compositionEdgeColors[hoveredCompositionNode.compositionType],
              strokeWidth: 2,
            },
            animated: true,
          }
        }
      }
      return edge
    })
  }, [edges, hoveredCompositionNode, nodes])
  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: ConnectionLineType.SmoothStep,
            animated: true,
          },
          eds,
        ),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const extractChildren = async (props: IObject, parent: IObject) => {
    const children: Node[] = []
    for (const prop in props) {
      const id = String(Math.floor(Math.random() * 1000000))
      const propData = props[prop]
      const compositionSource = propData._compositionSource as CompositionType | undefined
      const directComposition = getCompositionType(propData)

      if (propData.$ref) {
        const res = await resolveRef(propData.$ref, schema)
        children.push({
          id,
          type: directComposition ? 'schema' : 'default',
          data: {
            ...propData,
            label: prop,
            parent: parent.id,
            relations: { ...parent.relations, [parent.id]: 'node' },
            ...res,
            children: [],
            compositionType: directComposition,
            compositionSource,
          },
          position: position,
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
        })
      } else {
        children.push({
          id,
          type: directComposition ? 'schema' : 'default',
          data: {
            ...propData,
            label: prop,
            id,
            parent: parent.id,
            relations: { ...parent.relations, [parent.id]: 'node' },
            children: [],
            compositionType: directComposition,
            compositionSource,
          },
          position: position,
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
        })
      }
    }
    return children
  }

  const fetchInitialChildren = async () => {
    const newNodes: Node[] = []
    const properties = (initialNode.data as unknown as NodeData).properties
    const children = await extractChildren(properties, initialNode)
    const nodeType = initialNode.data.compositionType ? 'schema' : 'input'
    newNodes.push({
      id: initialNode.id,
      type: nodeType,
      data: {
        children,
        label: initialNode.data.label,
        description: initialNode.data.description,
        properties: initialNode.data.properties,
        relations: initialNode.data.relations,
        compositionType: initialNode.data.compositionType,
        isRoot: true,
      },
      position: { x: 0, y: 0 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    })
    setNodes(newNodes)
  }

  useEffect(() => {
    fetchInitialChildren()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Node focus when clicked
  const focusNode = (children: Node[], zoom: number) => {
    if (children.length === 0) return
    let middleChild = children[Math.floor(children.length / 2)]
    const middleChildWithLatestPosition = nodes.filter((a) => a.id == middleChild.id)[0]
    if (middleChildWithLatestPosition) {
      middleChild = middleChildWithLatestPosition
    }
    setCenter(middleChild.position.x, middleChild.position.y, { zoom, duration: 1000 })
  }

  // On Node Click
  const nodeClick = async (_event: React.MouseEvent, node: Node) => {
    const findChildren = nodes.filter((item) => item?.data?.parent === node.id)
    if (!findChildren.length) {
      const itemChildren = (node.data as unknown as NodeData).children
      const newEdges: Edge[] = [
        ...edges,
        ...itemChildren.map((item: Node) => {
          return {
            id: String(Math.floor(Math.random() * 1000000)),
            source: item?.data?.parent as string,
            target: item?.id,
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
          }
        }),
      ]
      //TODO: Fix nodes type error
      const newNodes = nodes.concat(itemChildren)
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(newNodes, newEdges, 'LR')
      setNodes([...layoutedNodes])
      setEdges([...layoutedEdges])
      if (itemChildren.length > 0) {
        focusNode(itemChildren, 0.9)
      }
    } else {
      const newNodes = removeElementsByParent(nodes, node.id)
      const newEdges = removeEdgesByParent(edges, node.id)
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(newNodes, newEdges, 'LR')
      setNodes([...layoutedNodes])
      setEdges([...layoutedEdges])
      focusNode([node], 0.9)
    }
  }

  //On Node Hover
  async function handleMouseEnter(_e: React.MouseEvent, node: Node) {
    if (!nNodes[node.id]) {
      const itemChildren: Node[] = []
      const nodeChildren = (node.data as unknown as NodeData).children
      await Promise.all(
        nodeChildren.map(async (item: Node) => {
          let children: Node[] = []
          const label = (item.data as unknown as NodeData).label
          const extractProps = propMerge(item.data, label)
          // Extract and remove metadata before creating children
          const nestedComposition = extractProps._nestedComposition as CompositionType | undefined
          delete extractProps._nestedComposition
          if (Object.keys(extractProps).length > 0) {
            const res = await extractChildren(extractProps, item)
            children = res
          }
          const relations = {
            ...(node.data.relations as Record<number, string>),
            ...(item.data.relations as Record<number, string>),
          }
          // Check for direct composition or nested composition (from items/additionalProperties)
          const directComposition = getCompositionType(item.data)
          const compositionType = directComposition || nestedComposition || null
          // Get composition source tag if this child came from a composition
          const compositionSource = item.data._compositionSource as CompositionType | undefined
          // Use custom schema node type if node has composition, otherwise use default types
          const nodeType = compositionType ? 'schema' : children?.length > 0 ? 'default' : 'output'
          itemChildren.push({
            id: item.id,
            type: nodeType,
            data: {
              ...item.data, // Preserve all original schema data including rules
              label: `${item.data.label}`,
              children: children,
              relations: relations,
              compositionType,
              compositionSource,
            },
            position: position,
            sourcePosition: Position.Right,
            targetPosition: Position.Left,
          })
        }),
      )
      node.data.children = itemChildren
      nNodes[node.id] = node
      setnNodes(nNodes)
    }

    // Track hovered node if it has a composition type
    const nodeData = node.data as unknown as NodeData
    if (nodeData.compositionType) {
      setHoveredCompositionNode({
        nodeId: node.id,
        compositionType: nodeData.compositionType,
      })
    }

    setCurrentNode(node)
  }

  // On Node Mouse Leave
  function handleMouseLeave() {
    setHoveredCompositionNode(null)
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={styledEdges}
      edgeTypes={edgeTypes}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      connectionLineType={ConnectionLineType.SmoothStep}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeMouseEnter={handleMouseEnter}
      onNodeMouseLeave={handleMouseLeave}
      onNodeClick={nodeClick}
      fitView={true}
      defaultViewport={{ x: 1, y: 1, zoom: 0.9 }}
    >
      <MiniMap />
      <Controls />
      <Background />
    </ReactFlow>
  )
}

export default ({ setCurrentNode, setnNodes, nNodes, initialNode, schema }: NodeProps) => (
  <ReactFlowProvider>
    <Flow
      setnNodes={setnNodes}
      nNodes={nNodes}
      setCurrentNode={setCurrentNode}
      initialNode={initialNode}
      schema={schema}
    />
  </ReactFlowProvider>
)
