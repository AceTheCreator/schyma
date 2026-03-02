import React from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { prism } from 'react-syntax-highlighter/dist/cjs/styles/prism'

const CodeComponent = ({ children }: any) => {
  return (
    <SyntaxHighlighter
      language='json'
      style={prism}
      customStyle={{
        margin: 0,
        borderRadius: 0,
        background: '#ffffff',
        fontSize: '12px',
      }}
      showLineNumbers={true}
    >
      {children}
    </SyntaxHighlighter>
  )
}

export default CodeComponent
