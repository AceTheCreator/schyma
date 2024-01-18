/* eslint-disable import/no-anonymous-default-export */
import React, { useCallback, useState } from 'react'
import { SmartBezierEdge } from '@tisoap/react-flow-smart-edge'
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
  MarkerType,
  useReactFlow,
  ConnectionLineType,
  Edge,
  Node,
  Connection,
} from 'reactflow'
import dagre from 'dagre'
import {nameFromRef, removeElementsByParent } from '../utils/reusables'


const position = { x: 0, y: 0 };

const initialEdges = [
  {
    id: 'edges-e5-7',
    source: '0',
    target: '1',
    label: '+',
    labelBgPadding: [8, 4],
    labelBgBorderRadius: 4,
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
];


const dagreGraph = new dagre.graphlib.Graph()
dagreGraph.setDefaultEdgeLabel(() => ({}))

const nodeWidth = 172
const nodeHeight = 36

const getLayoutedElements = (nodes: any, edges: any, direction = 'LR') => {
  const isHorizontal = direction === 'LR'
  dagreGraph.setGraph({ rankdir: direction })

  nodes.forEach((node: any) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
  })

  edges.forEach((edge: any) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  nodes.forEach((node: any) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    node.targetPosition = isHorizontal ? 'left' : 'top'
    node.sourcePosition = isHorizontal ? 'right' : 'bottom'
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 3,
      y: nodeWithPosition.y - nodeHeight / 3,
    }
    return node
  })

  return { nodes, edges }
}

type MyObject = { [x: string]: any }

type NodeProps = {
  setCurrentNode: (node: Node) => void
  initialNode: Node[]
  rNodes: any,
}

const Nodes = ({ setCurrentNode, rNodes, initialNode, }: NodeProps) => {
  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements([initialNode], initialEdges)
  const { setCenter } = useReactFlow()
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>(layoutedEdges);
  const [nodeState, setNodeState] = useState<any>({});

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

  const focusNode = (x: number, y: number, zoom: number) => {
    setCenter(x, y, { zoom, duration: 1000 })
  }

  const testClick = (_event: React.MouseEvent, data: MyObject) => {
    console.log(data)
    const props = data.properties;
    const children = [];
    for (const prop in props){
      const id = String(Math.floor(Math.random() * 1000000));
      props[prop].id = id;
      props[prop].parent = data.id
      props[prop].data = {
        label: prop
      }
      children.push(props[prop])
      if(props[prop].$ref){
        props[prop].type = "default"
        // console.log(getLabel)
        // console.log(props[prop].$ref)
      }else{
        props[prop].type = "output"
      }
    } 
    if(nodeState?.node === data.id){
      const res:any = removeElementsByParent(nodes, data.id);
      setNodes(res)
      setNodeState({})
    }else{
      if(children){
        const itemChildren = [
          ...children.map((item: MyObject) => {
            return {
              id: item.id,
              type: 'default',
              parent: item.parent,
              data: item,
              position,
              relations: item.relations,
              style: { padding: 10, background: '#1E293B', color: 'white' },
              sourcePosition: 'right',
              targetPosition: 'left',
              draggable: false,
            }
          }),
        ]
        const newEdges = [
          ...edges,
          ...itemChildren.map((item) => {
            return {
              id: String(Math.floor(Math.random() * 1000000)),
              source: item?.parent,
              target: item?.id,
              animated: true,
              // style: { stroke: required && required.includes(item.data.label) ? '#EB38AB' : 'gray' },
              markerEnd: {
                type: MarkerType.ArrowClosed,
              },
            }
          }),
        ]
        const newNodes = nodes.concat(children)
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(newNodes, newEdges, 'LR')
        setNodes([...layoutedNodes])
        setEdges([...layoutedEdges])
        if (itemChildren.length > 3) {
          focusNode(itemChildren[3].position.x, itemChildren[3].position.y, 0.9)
        }
      }
      setNodeState({node: data.id})
    }
  }

  function handleMouseEnter(_e: any, data: Node) {
    setCurrentNode(data)
  }
  const edgeTypes = {
    smart: SmartBezierEdge,
  }
  return (
    <div
      className='wrapper'
      style={{
        width: '100%',
        height: '95vh',
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        connectionLineType={ConnectionLineType.SmoothStep}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={testClick}
        // onNodeMouseEnter={handleMouseEnter}
        fitView
        defaultViewport={{ x: 1, y: 1, zoom: 0.9 }}
      />
    </div>
  )
}

// eslint-disable-next-line react/display-name
export default ({ setCurrentNode, rNodes, initialNode }: NodeProps) => (
  <ReactFlowProvider>
    <Nodes setCurrentNode={setCurrentNode} rNodes={rNodes} initialNode={initialNode} />
  </ReactFlowProvider>
)
