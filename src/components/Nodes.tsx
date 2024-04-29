/* eslint-disable import/no-anonymous-default-export */
import React, { useCallback, useEffect } from 'react'
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
  Position,
} from 'reactflow'
import dagre from 'dagre'
import {propMerge, removeElementsByParent, resolveRef } from '../utils/reusables'
import { JSONSchema7Object } from 'json-schema'

const position =  { x: 0, y: 50 };
const initialEdges: [Edge] = [
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

const getLayoutedElements = (nodes: Node<any, string | undefined>[], edges: Edge<any>[], direction = 'LR') => {
  dagreGraph.setGraph({ rankdir: direction })

  nodes.forEach(node => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });


  edges.forEach((edge: Edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  nodes.forEach((node: Node) => {
    const nodeId = node.id;
    const nodeWithPosition = dagreGraph.node(nodeId);
    node.sourcePosition = Position.Right;
    node.targetPosition = Position.Left;
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
  setnNodes: any
  nNodes: { [x: string]: Node}
  initialNode: Node
  schema: JSONSchema7Object
}

const Nodes = ({ setCurrentNode, setnNodes ,initialNode, nNodes, schema }: NodeProps) => {
  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements([initialNode], initialEdges)
  const { setCenter } = useReactFlow()
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

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

  const focusNode = (children:any[], zoom: number) => {
    const length = children.length
    let middleChild
    if (length % 2 === 0) {
      const middleIndex = length / 2;
      middleChild = children[middleIndex]
    } else {
      const middleIndex = Math.floor(length / 2);
      middleChild = children[middleIndex]
    }
    setCenter(middleChild.position.x, middleChild.position.y, { zoom, duration: 1000 })
  }


  let initialNodes: MyObject = [initialNode];

  const extractChildren = async (props:MyObject, parent:MyObject) => {
    const children = [];
    for(const prop in props){
      const id = String(Math.floor(Math.random() * 1000000));
      if(props[prop].$ref){
        const res = await resolveRef(props[prop].$ref, schema);
        children.push({...props[prop], label:prop, id, parent:parent.id, relations:{...parent.relations, [parent.id]: 'node'}, ...res, children:[]})
      }else{
        children.push({...props[prop], label:prop, id, parent:parent.id, relations:{...parent.relations, [parent.id]: 'node'}, children:[]})
      }
    }
    return children;
  }

  useEffect(() => {
    const newNodes:Node[] = [];
    initialNodes.map(async (item:Node) => {
      const children = await extractChildren(item.data.properties, item);
      newNodes.push({
        id: item.id,
        type: "input",
        data: {
          children,
          label: item.data.label,
          description: item.data.description,
          properties: {...item.data.properties},
          relations: item.data.relations
        },
        position: { x: 0, y: 0 },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      })
    })
    setNodes(newNodes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nodeClick = async (_event: React.MouseEvent, node: Node) => {
    const findChildren = nodes.filter((item) => item?.data?.parent === node.id);
    if (!findChildren.length) {
      const itemChildren = node.data.children;
      const newEdges = [
        ...edges,
        ...node.data.children.map((item:Node) => {
          return {
            id: String(Math.floor(Math.random() * 1000000)),
            source: item?.data?.parent,
            target: item?.id,
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
          };
        }),
      ];
      //TODO: Fix nodes type error
      const newNodes = nodes.concat(node.data.children);
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(newNodes, newEdges, "LR");
      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
      if (itemChildren.length > 0) {
        focusNode(itemChildren, 0.9);
      }
    } else {
      const newNodes = removeElementsByParent(nodes, node.id);
      setNodes([...newNodes]);
    }
    }

  async function handleMouseEnter(_e: any, node: Node) {
    console.log(node)
    if(!nNodes[node.id]){
      const itemChildren: Node[] = [];
      await Promise.all(
        node.data.children.map(async (item:any) => {
          let children = [];
          const extractProps = propMerge(item);
          if(Object.keys(extractProps).length > 0){
            const res = await extractChildren(extractProps, item);
            children = res;
          }
          itemChildren.push({
            id: item.id,
            type: children?.length > 0 ? "default" : "output",
            data: {
              label: item.label,
              children: children,
              parent: item.parent,
              examples: item.examples,
              description: item.description,
              relations: item.relations,
            },
            position: position,
            sourcePosition: Position.Right,
            targetPosition: Position.Left,
            draggable: false,
          })
        })
      )
      node.data.children = itemChildren;
      nNodes[node.id] = node;
      setnNodes(nNodes)
    }
    setCurrentNode(node)
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
        onNodeClick={nodeClick}
        onNodeMouseEnter={handleMouseEnter}
        fitView
        defaultViewport={{ x: 1, y: 1, zoom: 0.9 }}
      />
    </div>
  )
}

// eslint-disable-next-line react/display-name
export default ({ setCurrentNode, setnNodes, nNodes, initialNode, schema }: NodeProps) => (
  <ReactFlowProvider>
    <Nodes setnNodes={setnNodes} nNodes={nNodes} setCurrentNode={setCurrentNode}  initialNode={initialNode} schema={schema} />
  </ReactFlowProvider>
)
