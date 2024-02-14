import React from "react";

import CodeBlock from "@theme/CodeBlock";
import TabItem from "@theme/TabItem";
import Tabs from "@theme/Tabs";

export const Installation: React.FC = () => {
  return (
    <Tabs
      defaultValue="npm"
      values={[
        { label: "npm", value: "npm" },
        { label: "yarn", value: "yarn" },
        { label: "pnpm", value: "pnpm" },
      ]}
    >
      <TabItem value="npm">
        <CodeBlock
          className="shiki github-light"
          language="bash"
          title="hi"
          showLineNumbers
        >
          <div className="code-container">
            <div className="line">{"npm i remotion @remotion/player"}</div>
          </div>
        </CodeBlock>
      </TabItem>

      <TabItem value="pnpm">
        <code>pnpm i remotion @remotion/player</code>
      </TabItem>
      <TabItem value="yarn">
        <code>yarn add remotion @remotion/player</code>
      </TabItem>
    </Tabs>
  );
};
