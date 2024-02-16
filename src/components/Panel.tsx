import React, { useEffect, useState } from 'react'
import { Node } from 'reactflow'
import Tables from './Tables'

type Props = {
  node: Node | undefined
  nodes: any
  title: string
  description: string
}

function Panel({ node, nodes, title, description }: Props) {
  const [view, setView] = useState<boolean>()
  const [children, setChildren] = useState(null);
  const [activeNode, setActiveNode] = useState<Node| undefined>(node)
  const data = node?.data;
  useEffect(() => {
    if(node){
      setView(true);
      if(data.properties){
        setChildren(data.properties);
        setActiveNode(node);
      }else{
        setActiveNode(nodes[data.parent])
        setChildren(nodes[data.parent].data.properties);
      }
    }
  },[node])

  if (view) {
    return (
      <div className='panel'>
        <h1>{activeNode?.data.title || activeNode?.data.label}</h1>
        <p>{activeNode?.data.description}</p>

        {children && <Tables nodes={children} active={node} />}

        {/* {nodeData?.schema?.examples && (
          <div className='examples-wrapper'>
            <h1>Examples</h1>
            {nodeData?.schema?.examples.map((example: any) => (
              <CodeComponent key={example.title}>{JSON.stringify(example, null, 2)}</CodeComponent>
            ))}
          </div>
        )} */}
      </div>
    )
  }
  return (
    <div className='panel'>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  )
}

export default Panel
