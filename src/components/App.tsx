import React, { useEffect } from "react";
import { Node} from 'reactflow';
import Panel from "./Panel";
import { useState } from "react";
import Nodes from "./Nodes";
import Ajv from "ajv";
import { propMerge, getCompositionType } from "../utils/reusables";
import { ISchyma } from "../types";

function Schyma({ title, description, schema, defaultCollapsed = false }: ISchyma) {
  const ajv = new Ajv();
  const [currentNode, setCurrentNode] = useState<Node>();
  const [nNodes, setnNodes ] = useState<{[x: string]: Node}>({});
  const [render, setRender] = useState(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(defaultCollapsed);
  const position = { x: 0, y: 0 };
  const properties = propMerge(schema, "");
  const compositionType = getCompositionType(schema);
  const initialNode: Node = {
    id: '1',
    type: compositionType ? 'schema' : 'input',
    data: {
      label: title,
      description,
      properties: properties,
      relations: {},
      compositionType,
      isRoot: true,
    },
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
          <Nodes setnNodes={setnNodes} setCurrentNode={setCurrentNode} nNodes={nNodes} initialNode={initialNode} schema={schema} isPanelCollapsed={isPanelCollapsed} />
        </div>
        <Panel
          title={title}
          description={description}
          node={currentNode}
          nodes={nNodes}
          isCollapsed={isPanelCollapsed}
          setIsCollapsed={setIsPanelCollapsed}
        />
      </div> : <div>loading</div>}
    </div>
  );
}

export default Schyma