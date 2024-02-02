import React, { useEffect } from "react";
import { Node } from 'reactflow';
import Panel from "./Panel";
import { useState } from "react";
import Nodes from "./Nodes";
import { JSONSchema7Object } from "json-schema";
import Ajv from "ajv";
import traverse from 'json-schema-traverse'
import { resolveRef, extractProps, extractAdditionalProps, extractArrayProps} from "../utils/reusables";

interface Default {
  title: string;
  description: string;
  schema: JSONSchema7Object
}


function Serval({ title, description, schema }: Default) {
  const ajv = new Ajv();
  const [currentNode, setCurrentNode] = useState<Node>();
  const [nChildren, setnChildren] = useState<any>(null);
  const [tree, setTree] = useState(true);
  const position = { x: 0, y: 0 };

  const initialNode = {
    id: '1',
    type: 'input',
    data: { label: title, description},
    properties: schema.properties,
    relations: {
      0: 'node'
    },
    position,
  }

  return (
    <div>
      {tree ? <div className="body-wrapper">
        <div className="node-container">
        <Nodes setCurrentNode={setCurrentNode} setnChildren={setnChildren} initialNode={initialNode} schema={schema} />
        </div>
        <Panel
          title={title}
          description={description}
          node={currentNode}
          nodes={nChildren}
        />
      </div> : <div>Loading</div>}
    </div>
  );
}

export default Serval