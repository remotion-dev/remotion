import React from "react"
import CodeBlock from "@theme/CodeBlock"
import MDXComponents from "@theme-init/MDXComponents"

const NewComponents = {
  ...MDXComponents,
  div: props => (props.className === "shiki-twoslash-fragment" ? <>{props.children}</> : <div {...props} />),
  pre: props => <CodeBlock {...props} />,
  code: props => <code {...props} />,
}

export default NewComponents
