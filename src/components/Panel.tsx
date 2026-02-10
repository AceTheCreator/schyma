import React, { useEffect, useState } from 'react'
import { Node } from 'reactflow'
import Tables from './Tables'
import CodeComponent from './Code'
import { formatRequiredSentence } from '../utils/formatRequired'

type Props = {
  node: Node | undefined
  nodes: { [x: string]: Node }
  title: string
  description: string
}

type MainTab = 'examples' | 'json'

function Panel({ node, nodes, title, description }: Props) {
  const [view, setView] = useState<boolean>()
  const [children, setChildren] = useState<Node[]>([])
  const [activeNode, setActiveNode] = useState<Node | undefined>(node)
  const [activeExampleIndex, setActiveExampleIndex] = useState(0)
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('examples')
  const data = node?.data
  useEffect(() => {
    if (node) {
      setView(true)
      setActiveExampleIndex(0)
      if (data.children.length > 0) {
        setChildren(data.children)
        setActiveNode(node)
      } else {
        setActiveNode(nodes[data.parent])
        setChildren(nodes[data.parent].data.children)
      }
    }
  }, [node])
  if (view) {
    return (
      <div className='panel'>
        <h1>{activeNode?.data.title || activeNode?.data.label}</h1>
        <p>{activeNode?.data.description}</p>

        {activeNode?.data?.required && activeNode.data.required.length > 0 && (
          <p className='required-sentence'>{formatRequiredSentence(activeNode.data.required)}</p>
        )}

        {children.length > 0 && <Tables nodes={children} active={node} />}

        {(() => {
          const hasExamples = activeNode?.data?.examples && activeNode.data.examples.length > 0
          const hasJson = activeNode?.data?._json

          if (!hasExamples && !hasJson) return null

          return (
            <div className='panel-code-section'>
              <div className='main-tabs'>
                {hasExamples && (
                  <button
                    className={`main-tab ${activeMainTab === 'examples' || !hasJson ? 'main-tab-active' : ''}`}
                    onClick={() => setActiveMainTab('examples')}
                  >
                    Examples
                  </button>
                )}
                {hasJson && (
                  <button
                    className={`main-tab ${activeMainTab === 'json' || !hasExamples ? 'main-tab-active' : ''}`}
                    onClick={() => setActiveMainTab('json')}
                  >
                    JSON
                  </button>
                )}
              </div>

              {(activeMainTab === 'examples' || !hasJson) && hasExamples && (
                <div className='examples-wrapper'>
                  {activeNode.data.examples.length > 1 && (
                    <div className='example-header'>
                      <div className='examples-tabs'>
                        {activeNode.data.examples.map((example: any, index: number) => (
                          <button
                            key={index}
                            className={`examples-tab ${activeExampleIndex === index ? 'examples-tab-active' : ''}`}
                            onClick={() => setActiveExampleIndex(index)}
                          >
                            {example.title || `#${index + 1}`}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className='examples-content'>
                    <div className='examples-code-container'>
                      <CodeComponent>{JSON.stringify(activeNode.data.examples[activeExampleIndex], null, 2)}</CodeComponent>
                    </div>
                  </div>
                </div>
              )}

              {(activeMainTab === 'json' || !hasExamples) && hasJson && (
                <div className='json-wrapper'>
                  <div className='examples-code-container'>
                    <CodeComponent>{JSON.stringify(activeNode?.data._json, null, 2)}</CodeComponent>
                  </div>
                </div>
              )}
            </div>
          )
        })()}
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
