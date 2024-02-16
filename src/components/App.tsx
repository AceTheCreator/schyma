import React, { useEffect } from "react";
import { Node } from 'reactflow';
import Panel from "./Panel";
import { useState } from "react";
import Nodes from "./Nodes";
import { JSONSchema7Object } from "json-schema";
import Ajv from "ajv";

interface Default {
  title: string;
  description: string;
  schema: JSONSchema7Object
}


function Serval({ title, description, schema }: Default) {
  const ajv = new Ajv();
  const [currentNode, setCurrentNode] = useState<Node>();
  const [nodeMaps, setNodeMaps] = useState<any>({});
  const [render, setRender] = useState(false);
  const position = { x: 0, y: 0 };

  const initialNode = {
    id: '1',
    type: 'input',
    data: { label: title, description, properties: schema.properties, relations: {},},
    position,
  }
  const validate = ajv.validateSchema(schema);
  useEffect(() => {
    if(validate){
      setRender(true)
    }
  },[validate])
  return (
    <div>
      {render ? <div className="body-wrapper">
        <div className="node-container">
        <Nodes nodeMaps={nodeMaps} setCurrentNode={setCurrentNode} setNodeMaps={setNodeMaps} initialNode={initialNode} schema={schema} />
        </div>
        <Panel
          title={title}
          description={description}
          node={currentNode}
          nodes={nodeMaps}
        />
      </div> : <div>loading</div>}
    </div>
  );
}

export default Serval