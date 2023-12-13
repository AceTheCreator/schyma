import React, { useEffect } from "react";
import { Node } from 'reactflow';
import Panel from "./Panel";
import { useState } from "react";
import Nodes from "./Nodes";
import { JSONSchema7Object } from "json-schema";
import Ajv from "ajv";
import traverse from 'json-schema-traverse'
import { resolveRef, deepCopy, extractProps, extractAdditionalProps, extractArrayProps} from "../utils/reusables";

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
      data: { label: title, description },
      relations: {
        0: 'node'
      },
      position,
    },
  ];

  function build(schema: JSONSchema7Object) {
    const validate = ajv.validateSchema(schema);
      if (validate) {
        if(schema.properties){
          extractProps(schema.properties, rN, {id: '1'})
        }
        function callbackFn(schema: any, _JSONPointer: any, rootSchema: any, _parentJSONPointer: any, _parentKeyword: any, _parentSchema: any, _keyIndex: any) {
          setTimeout(() => {
            if(schema.id){
              if(schema.oneOf && schema.id){
                const items = schema.oneOf
                extractArrayProps(items, rN, schema)
            }
            }
            if(schema.items && schema?.id){
              let items = schema.items;
              extractAdditionalProps(items, rN, schema)
            }
            if(schema.additionalProperties && schema.id){
              extractAdditionalProps(schema.additionalProperties, rN, schema)
          }
          if(schema?.patternProperties){
            if(schema.id){
              extractProps(schema.patternProperties, rN, schema)
            }
          }
          if (schema.$ref && schema.$ref !== '#') {
              resolveRef(schema.$ref, rootSchema).then((resolvedSchema) => {
                const copied = resolvedSchema;
                if(copied?.oneOf && schema?.id){
                  const items = copied.oneOf
                  extractArrayProps(items, rN, schema)
                }
                if(copied?.allOf && schema?.id){
                  extractArrayProps(copied.allOf, rN, schema)
                }
                if(copied?.additionalProperties){
                  if(schema.id){
                    extractAdditionalProps(copied.additionalProperties, rN, schema)
                  }    
                }
                if(copied?.items && schema?.id){
                  let items = copied.items;
                  extractAdditionalProps(items, rN, schema)
                }
                if(copied?.patternProperties && schema?.id){
                  extractProps(copied.patternProperties, rN, schema)
                }
                if(copied?.properties && schema?.id){
                    extractProps(copied.properties, rN, schema)
                }
              });
          }
          },0)
        }
        traverse(schema, { cb: callbackFn });
    }
    }
  useEffect(() => {
    build(schema)
    setNodes(rN)
  }, [])

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