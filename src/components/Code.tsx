import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/cjs/styles/hljs";

const CodeComponent = ({ children }: any) => {
  return  (
    <SyntaxHighlighter
      language="javascript"
      style={dracula}
      customStyle={{
        background: "#1E293B",
        borderRadius: "10px",
        color: "#94A3B8"
      }}
      showLineNumbers={true}
      
    >
      {children}
    </SyntaxHighlighter>
  ) 
};

export default CodeComponent;