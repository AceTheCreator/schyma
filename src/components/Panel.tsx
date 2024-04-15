import React, { useEffect, useState } from 'react'
import { Node } from 'reactflow'
import Tables from './Tables'
import CodeComponent from './Code'

type Props = {
  node: Node | undefined
  nodes: any
  title: string
  description: string
}

function Panel({ node, nodes, title, description }: Props) {
  const [view, setView] = useState<boolean>()
  const [children, setChildren] = useState([]);
  const [activeNode, setActiveNode] = useState<Node| undefined>(node)
  const data = node?.data;
  useEffect(() => {
    if(node){
      setView(true);
      if(data.children.length > 0){
        setChildren(data.children)
        setActiveNode(node);
      }else{
        setActiveNode(nodes[data.parent])
        setChildren(nodes[data.parent].data.children);
      }
    }
  },[node])
  if (view) {
    return (
      <div className='panel'>
        <h1>{activeNode?.data.title || activeNode?.data.label}</h1>
        <p>{activeNode?.data.description}</p>

        {children.length > 0 && <Tables nodes={children} active={node} />}

        {activeNode?.data?.examples && (
          <div className='examples-wrapper'>
            <h1 className='font-bold'>Examples</h1>
            {activeNode?.data.examples.map((example: any) => (
              <CodeComponent key={example.title}>{JSON.stringify(example, null, 2)}</CodeComponent>
            ))}
          </div>
        )}
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
