import React, { useEffect } from 'react';
import { Edge, Node, Position } from 'reactflow';
import Panel from './Panel';
import { useState } from 'react';
import Nodes from './Nodes';
import { JSONSchema7Object } from 'json-schema';
import Ajv from 'ajv';
import { propMerge } from '../utils/reusables';
import dagre from 'dagre';
import { nodeHeight, nodeWidth } from '../constants/node';

interface Default {
  title: string;
  description: string;
  schema: JSONSchema7Object
}


function Schyma({ title, description, schema }: Default) {
  const ajv = new Ajv();
  const [currentNode, setCurrentNode] = useState<Node>();
  const [nNodes, setnNodes ] = useState<{[x: string]: Node}>({});
  const [render, setRender] = useState(false);
  const position = { x: 0, y: 0 };
  const properties = propMerge(schema, "");
  const initialNode: Node = {
    id: '1',
    data: {
      label: title, 
      description, 
      properties: properties, 
      relations: {},
    },
    position,
  }
  const validate = ajv.validateSchema(schema);

  const dagreGraph = new dagre.graphlib.Graph()

  dagreGraph.setDefaultEdgeLabel(() => ({}))

  const getLayoutedElements = (nodes: Node<any, string | undefined>[], edges: Edge<any>[], direction = 'LR') => {
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

  useEffect(() => {
    if(validate){
      setRender(true)
    }
  },[validate])
  return (
    <div>
      {render ? (
        <div className='body-wrapper'>
          <div className='node-container'>
            <Nodes
              setnNodes={setnNodes}
              nNodes={nNodes}
              setCurrentNode={setCurrentNode}
              initialNode={initialNode}
              schema={schema}
              getLayoutedElements={getLayoutedElements}
            />
          </div>
          <Panel title={title} description={description} node={currentNode} nodes={nNodes} />
        </div>
      ) : (
        <div>loading</div>
      )}
    </div>
  )
}

export default Schyma
