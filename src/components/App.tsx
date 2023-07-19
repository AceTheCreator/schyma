import React, { useEffect } from "react";
import { Node } from 'reactflow';
import Panel from "./Panel";
import { useState } from "react";
import Nodes from "./Nodes";
import { JSONSchema7Object } from "json-schema";
import Ajv from "ajv";
import { startBuild } from "../scripts";
import traverse from 'json-schema-traverse'
import { checkRefExists } from "../utils/reusables";

interface Default {
  title: string;
  description: string;
  schema: JSONSchema7Object
}


function Visualizer({ title, description, schema }: Default) {
  const ajv = new Ajv();
  const [currentNode, setCurrentNode] = useState<Node>();
  const [nodes, passNodes] = useState<Node[]>();
  const [tree, setTree] = useState(null);

  function resolveRef(ref: any, rootSchema: any, parentSchema: any) {
    // Assuming the ref is a local reference within the same schema
    const refPath = ref.substring(1).split('/'); // Remove the leading '#' and split the path
    let resolvedSchema = rootSchema;
    let segmentHolder:any = {};
    segmentHolder = rootSchema[refPath[1]];
    if (refPath.length > 3) {
      resolvedSchema = undefined
    } else {
      resolvedSchema = segmentHolder[refPath[2]]
    }
    for (let i = 0; i < refPath; i++){
      if (refPath[i] === 'definitions') {
        segmentHolder = rootSchema[refPath[i]];
      }
    }
    checkRefExists(resolvedSchema, ref);
    return resolvedSchema;
  }

  useEffect(() => {
    // validate schema
    async function build(schema: JSONSchema7Object) {
    const validate = ajv.validateSchema(schema);
      if (validate) {
        function callbackFn(schema: any, JSONPointer: any, rootSchema: any, parentJSONPointer: any, parentKeyword: any, parentSchema: any, keyIndex: any) {
          if (schema.$ref) {
            const resolvedSchema = resolveRef(schema.$ref, rootSchema, parentSchema);
            // Update the current schema with the resolved schema
            Object.assign(schema, resolvedSchema);
          }
        }
        traverse(schema, { cb: callbackFn });
        console.log(schema)
      const res: any = await startBuild(schema)
      setTree(res)
    }
    }
    build(schema)
  }, [])
  return (
    <div>
      {tree ? <div className="body-wrapper">
        <div className="node-container">
            {tree && <Nodes setCurrentNode={setCurrentNode} passNodes={passNodes} tree={tree} />}
        </div>
        <Panel
          title={title}
          description={description}
          node={currentNode}
          nodes={nodes}
        />
      </div> : <div />}
    </div>
  );
}

export default Visualizer