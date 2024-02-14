import React from "react";

import CodeBlock from "@theme/CodeBlock";
import TabItem from "@theme/TabItem";
import Tabs from "@theme/Tabs";
import { VERSION } from "remotion";

const LightAndDark: React.FC<{
  text: string;
}> = ({ text }) => {
  return (
    <>
      <CodeBlock
        className="shiki github-light"
        language="bash"
        style={{
          backgroundColor: "rgb(255, 255, 255)",
          color: "rgb(36, 41, 47)",
        }}
      >
        <div className="code-container">
          <div className="line">{text}</div>
        </div>
      </CodeBlock>
      <CodeBlock
        className="shiki github-dark"
        language="bash"
        style={{
          backgroundColor: "rgb(13, 17, 23)",
          color: "rgb(201, 209, 217)",
        }}
      >
        <div className="code-container">
          <div className="line">{text}</div>
        </div>
      </CodeBlock>
    </>
  );
};

export const Installation: React.FC<{
  pkg: string;
}> = ({ pkg }) => {
  if (pkg === undefined) {
    throw new Error("pkg is undefined");
  }

  return (
    <div>
      <Tabs
        defaultValue="npm"
        values={[
          { label: "npm", value: "npm" },
          { label: "yarn", value: "yarn" },
          { label: "pnpm", value: "pnpm" },
          { label: "bun", value: "bun" },
        ]}
      >
        <TabItem value="npm">
          <LightAndDark text={`npm i --save-exact ${pkg}@${VERSION}`} />
        </TabItem>
        <TabItem value="pnpm">
          <LightAndDark text={`pnpm i ${pkg}@${VERSION}`} />
        </TabItem>
        <TabItem value="bun">
          <LightAndDark text={`bun i ${pkg}@${VERSION}`} />
        </TabItem>
        <TabItem value="yarn">
          <LightAndDark text={`yarn --exact add ${pkg}@${VERSION}`} />
        </TabItem>
      </Tabs>
      This assumes you are currently using v{VERSION} of Remotion.
      <br />
      Also update <code>remotion</code> and all <code>`@remotion/*`</code>{" "}
      packages to the same version.
      <br />
      Remove all <code>^</code> character in front of the version numbers of it
      as it can lead to a version conflict.
    </div>
  );
};
