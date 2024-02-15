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
import {arrayToProps, propMerge, removeElementsByParent, resolveRef } from '../utils/reusables'


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
  setnChildren: (node: Node) => void
  initialNode: Node
  schema: any
}

const nodeMaps:any = {};
const refStorage: any = {};

const Nodes = ({ setCurrentNode, setnChildren, initialNode, schema }: NodeProps) => {
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

  const nodeClick = async (_event: React.MouseEvent, data: MyObject) => {
    const label = data?.data.label;
    let props = data.properties;
    const newLabel = `${label}${data.parentLabel}`
    const nodeProps:any = {}
    if(refStorage[newLabel]){
      props = refStorage[newLabel].properties
    }else{
      if(label && refStorage[label]){
        if(label === data.parentLabel && refStorage[`${label}child`]){
          props = refStorage[`${label}child`].properties
        }else{
          props = refStorage[label].properties
        }
      }
    }

    if(props){
      for(let prop in props){
        if(refStorage[prop]){
          nodeProps[prop] = refStorage[prop]
        }else{
          nodeProps[prop] = props[prop]
        }
      }
      props = nodeProps
    }
    const children = [];
    for (const prop in props){
      const id = String(Math.floor(Math.random() * 1000000));
      props[prop].id = id;
      props[prop].parent = data.id
      props[prop].parentLabel = label;
      props[prop].data = {
        label: prop
      }
      children.push(props[prop])
      if(props[prop].oneOf || props[prop].items || props[prop].patternProperties || props[prop].additionalProperties  ){
        props[prop].type = "default"
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

  function extractArrProps(props:any, label: any){
    const arrProps = arrayToProps(props);
    if(refStorage[label]){
    }else{
      refStorage[label] = {
        properties: arrProps
      };
    }
    return arrProps
  }

  function extractOtherPropTypes(data:any, label:string){
    let properties
    if(data.parentLabel === label){
      properties = refStorage[`${label}child`].properties
    }else{
      if(data.oneOf){
        const propRes = extractArrProps(data.oneOf, label)
        properties = propRes
      }
      if(data.items){
        const {items} = data;
        if(items.oneOf){
          const propRes = extractArrProps(items.oneOf, label)
          properties = propRes
        }
      }
      const newLabel = `${label}${data.parentLabel}`
      if(refStorage[newLabel]){
        const mergedProp = propMerge(refStorage[newLabel])
        properties = mergedProp
        if(JSON.stringify(refStorage[newLabel].properties) !== JSON.stringify(mergedProp) ){
          refStorage[newLabel].properties = mergedProp
        }
    }else{
      if(label && refStorage[label]){
        const mergedProp = propMerge(refStorage[label])
        properties = mergedProp
        if(JSON.stringify(refStorage[label].properties) !== JSON.stringify(mergedProp) ){
          refStorage[label].properties = mergedProp
        }
      }
    }
    }
    return properties
  }

  async function handleMouseEnter(_e: any, node: Node) {
    const data = node.data;
    const label = node?.data.label;
    let props = data.properties
    const getProperties = extractOtherPropTypes(node, label);
    if(getProperties){
      props = {...props, ...getProperties}
   }
    const nodeProps:any = {}
    // check if node as description
    if(props && Object.keys(props).length > 0){
      for (const prop in props){
        if(props[prop].$ref){
          const res = await resolveRef(props[prop].$ref, schema);
          if(prop === label){
            const newProp = `${prop}child`
            refStorage[newProp] = res
          }else{
            refStorage[prop] = res;
          }
          nodeProps[prop] = res;
        }
        else{
          //:TODO: Add support for resolved object for children
          const propName = `${prop}${label}`;
          refStorage[propName] = props[prop]
          nodeProps[prop] = props[prop];
        }
      }
      data.properties = nodeProps;
      if(nodeMaps[node.id]){
        console.log('ldf')
      }else{
        nodeMaps[node.id] = node;
      }
      setnChildren(node)
    }else{
      setnChildren(nodeMaps[node.parent])
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
export default ({ setCurrentNode, setnChildren, initialNode, schema }: NodeProps) => (
  <ReactFlowProvider>
    <Nodes setCurrentNode={setCurrentNode} setnChildren={setnChildren}  initialNode={initialNode} schema={schema} />
  </ReactFlowProvider>
)
