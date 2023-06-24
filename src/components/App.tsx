import React from "react";
import { Node } from 'reactflow';
import Panel from "./Panel";
import { useState } from "react";
import Nodes from "./Nodes";

interface Default {
  title: string;
  description: string;
}

function Visualizer({title, description}: Default ) {
  const [currentNode, setCurrentNode] = useState<Node>();
  const [nodes, passNodes] = useState<Node[]>();
  return (
    <div>
      <div className="body-wrapper">
        <div className="node-container">
            <Nodes setCurrentNode={setCurrentNode} passNodes={passNodes} />
        </div>
        <Panel
          title={title}
          description={description}
          node={currentNode}
          nodes={nodes}
        />
      </div>
    </div>
  );
}

export default Visualizer