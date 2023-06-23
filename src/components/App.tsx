import React from "react";
import { Node } from 'reactflow';
import Panel from "./Panel";
import { useState } from "react";
import Nodes from "./Nodes";

function Visualizer() {
  const [currentNode, setCurrentNode] = useState<Node>();
  const [nodes, passNodes] = useState<Node[]>();
  return (
    <div>
      <div className="body-wrapper">
        <div className="node-container w-[60%] flex flex-col">
          <div className="m-3 rounded-lg">
            <Nodes setCurrentNode={setCurrentNode} passNodes={passNodes} />
          </div>
        </div>
        <Panel
          node={currentNode}
          nodes={nodes}
        />
      </div>
    </div>
  );
}

export default Visualizer