import React, { useEffect } from "react";
import { Node } from 'reactflow';
import Panel from "./Panel";
import { useState } from "react";
import Nodes from "./Nodes";
import { JSONSchema7Object } from "json-schema";
import Ajv from "ajv";
import { startBuild } from "../scripts";

interface Default {
  title: string;
  description: string;
  schema: JSONSchema7Object
}

function Visualizer({ title, description, schema }: Default) {
  const ajv = new Ajv();
  const [currentNode, setCurrentNode] = useState<Node>();
  const [nodes, passNodes] = useState<Node[]>();
  const [tree, setTree] = useState(null)
  useEffect(() => {
    // validate schema
    async function build(schema: any) {
    const validate = ajv.validateSchema(schema);
    if (validate) {
      const res: any = await startBuild(schema)
      console.log(res)
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