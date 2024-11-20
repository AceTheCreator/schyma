import React, { useCallback, useEffect } from 'react'
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
import { propMerge, removeEdgesByParent, removeElementsByParent, resolveRef } from '../utils/reusables'
import { JSONSchema7Object } from 'json-schema'
import { IObject, NodeData } from '../types'
import { getLayoutedElements } from '../utils/dagreUtils'

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

function Flow({ initialNode, nNodes, setnNodes, setCurrentNode, schema }: NodeProps) {
  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements([initialNode], initialEdges)
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges)
  const { setCenter } = useReactFlow()
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
      if (props[prop].$ref) {
        const res = await resolveRef(props[prop].$ref, schema)
        children.push({
          id,
          type: 'input',
          data: {
            ...props[prop],
            label: prop,
            parent: parent.id,
            relations: { ...parent.relations, [parent.id]: 'node' },
            ...res,
            children: [],
          },
          position: position,
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
        })
      } else {
        children.push({
          id,
          type: 'input',
          data: {
            ...props[prop],
            label: prop,
            id,
            parent: parent.id,
            relations: { ...parent.relations, [parent.id]: 'node' },
            children: [],
          },
          position: position,
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
        })
      }
    }
    return children
  }

  useEffect(() => {
    const fetchInitialChildren = async () => {
      const newNodes: Node[] = []
      const properties = (initialNode.data as unknown as NodeData).properties
      const children = await extractChildren(properties, initialNode)
      newNodes.push({
        id: initialNode.id,
        type: 'input',
        data: {
          children,
          label: initialNode.data.label,
          description: initialNode.data.description,
          properties: initialNode.data.properties,
          relations: initialNode.data.relations,
        },
        position: { x: 0, y: 0 },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      })
      setNodes(newNodes)
    }

    fetchInitialChildren()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Node focus when clicked
  const focusNode = (children: Node[], zoom: number) => {
    const length = children.length
    let middleChild
    if (length % 2 === 0) {
      const middleIndex = length / 2
      middleChild = children[middleIndex]
    } else {
      const middleIndex = Math.floor(length / 2)
      middleChild = children[middleIndex]
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
          if (Object.keys(extractProps).length > 0) {
            const res = await extractChildren(extractProps, item)
            children = res
          }
          const relations = {
            ...(node.data.relations as Record<number, string>),
            ...(item.data.relations as Record<number, string>),
          }
          itemChildren.push({
            id: item.id,
            type: children?.length > 0 ? 'default' : 'output',
            data: {
              label: item.data.label,
              children: children,
              parent: item.data.parent,
              examples: item.data.examples,
              description: item.data.description,
              relations: relations,
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
    setCurrentNode(node)
  }

  const edgeTypes = {
    smart: SmartBezierEdge,
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      connectionLineType={ConnectionLineType.SmoothStep}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeMouseEnter={handleMouseEnter}
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
