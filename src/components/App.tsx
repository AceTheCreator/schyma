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
  const [nodes, setNodes] = useState(null);
  const [tree, setTree] = useState(false);
  const position = { x: 0, y: 0 };

  const rN: any = [
    {
      id: '1',
      type: 'input',
      data: { label: title },
      properties: schema.properties,
      description,
      relations: {
        0: 'node'
      },
      position,
    },
  ];


  // useEffect(() => {
  //   function build(schema: JSONSchema7Object) {
  //     const validate = ajv.validateSchema(schema);
  //       if (validate) {
  //         if(schema.properties){
  //           extractProps(schema, rN, {id: '1'}, schema)
  //         }
  //         function callbackFn(schema: any, _JSONPointer: any, rootSchema: any, _parentJSONPointer: any, _parentKeyword: any, _parentSchema: any, _keyIndex: any) {
  //           if(schema.properties){
  //             extractProps(schema, rN, {id: '1'}, schema)

  //           }
  //           // if (schema.$ref && schema.$ref !== '#') {
  //           //     resolveRef(schema.$ref, rootSchema).then((resolvedSchema) => {
  //           //       const copied = resolvedSchema;
  //           //       console.log(copied)

  //           //     });
  //           // }
  //         }
  //         traverse(schema, { cb: callbackFn });
  //     }
  //     }
  //   build(schema)

  //   console.log(schema)
  //   setNodes(rN)
  // }, [])

  useEffect(() => {
    setNodes(rN)
  },[])
  useEffect(() => {
    if(nodes){
      setTree(true)
    }
  },[nodes])
  return (
    <div>
      {tree ? <div className="body-wrapper">
        <div className="node-container">
        <Nodes setCurrentNode={setCurrentNode} rNodes={nodes} initialNode={rN[0]} />
        </div>
        <Panel
          title={title}
          description={description}
          node={currentNode}
          nodes={nodes}
        />
      </div> : <div>Loading </div>}
    </div>
  );
}

export default Serval