/* eslint-disable import/no-anonymous-default-export */
import React, { useCallback, useEffect, useState } from 'react'
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
import { removeChildren, removeElementsByParent } from '../utils/reusables'


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

const initialNodes = [
    {
      id: '1',
      type: 'input',
      data: { label: 'input' },
      position,
    },
]


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
  passNodes: (node: any) => void
  title: string,
  rNodes: any,
  rEdges: any
}

const Nodes = ({ setCurrentNode, passNodes, rNodes, rEdges, title }: NodeProps) => {
  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges)
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
    if(nodeState?.node === data.id){
      const res:any = removeElementsByParent(nodes, data.id);
      console.log(res)
      // setNodes([...res])
      // setNodes([...nodes.filter((node: any) => node.parent !== data.id)])
      // setEdges([...edges.filter((item) => data.id !== item.source)])
      setNodeState({})
    }else{
      const findChildren = rNodes.filter((item: any) => item?.parent === data.id)
      if(findChildren){
        const itemChildren = [
          ...findChildren.map((item: MyObject) => {
            return {
              id: item.id,
              type: 'default',
              parent: item.parent,
              data: item.data,
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
        const newNodes = nodes.concat(itemChildren)
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

  // const handleNodeClick = (_event: React.MouseEvent, data: MyObject) => {
  //   const findChildren = nodes.filter((item: any) => item?.data?.parent === data.id)
  //   if (!findChildren.length) {
  //     const required = data.data.required
  //     const itemChildren = [
  //       ...data.data.children.map((item: MyObject) => {
  //         return {
  //           id: item.id,
  //           parent: item.parent,
  //           // type: item?.children?.length ? 'default' : 'output',
  //           data: item.data,
  //           style: { padding: 10, background: '#1E293B', color: 'white' },
  //           sourcePosition: 'right',
  //           targetPosition: 'left',
  //           draggable: false,
  //         }
  //       }),
  //     ]
  //     const newEdges = [
  //       ...edges,
  //       ...itemChildren.map((item) => {
  //         return {
  //           id: String(Math.floor(Math.random() * 1000000)),
  //           source: item?.parent,
  //           target: item?.id,
  //           animated: true,
  //           // style: { stroke: required && required.includes(item.data.label) ? '#EB38AB' : 'gray' },
  //           markerEnd: {
  //             type: MarkerType.ArrowClosed,
  //           },
  //         }
  //       }),
  //     ]
  //     const newNodes = nodes.concat(itemChildren)
  //     const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(newNodes, newEdges, 'LR')
  //     setNodes([...layoutedNodes])
  //     setEdges([...layoutedEdges])
  //     if (itemChildren.length > 3) {
  //       focusNode(itemChildren[3].position.x, itemChildren[3].position.y, 0.9)
  //     }
  //   } else {
  //     const newNodes = removeChildren(data, nodes)
  //     setNodes([...newNodes])
  //     setEdges([...edges.filter((item) => data.id !== item.source)])
  //   }
  // }
  function handleMouseEnter(_e: any, data: Node) {
    setCurrentNode(data)
    passNodes(nodes)
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
export default ({ setCurrentNode, passNodes, title, rNodes, rEdges }: NodeProps) => (
  <ReactFlowProvider>
    <Nodes setCurrentNode={setCurrentNode} title={title} passNodes={passNodes} rNodes={rNodes} rEdges={rEdges} />
  </ReactFlowProvider>
)
