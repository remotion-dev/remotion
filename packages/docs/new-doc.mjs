import { existsSync, mkdirSync, writeFileSync } from "fs";

const template = `
---
title: A new documentation page
---

Write your article here and send it as a pull request!  
The Remotion team will categorize it for you.

To write a typechecked code snippet, start a code block using <code>\`\`\`tsx twoslash</code>:

\`\`\`tsx twoslash title="MyComponent.tsx"
import { useCurrentFrame } from "remotion";

const frame = useCurrentFrame();
\`\`\`

You can create numbered lists and sections using \`<Step>\`

<Step>1</Step> One <br/>
<Step>2</Step> Two <br/>

<br/>

For numbered items in a paragraph, use \`<InlineStep>\`: <InlineStep>1</InlineStep> One, <InlineStep>2</InlineStep> Two.

See the [Language guidelines](/docs/contributing/docs#language-guidelines) so your article fits well into the other ones available on the website.
`.trimStart();

if (!existsSync("new-docs")) {
  mkdirSync("new-docs");
}

writeFileSync("new-docs/new-doc.md", template);

console.log('Created new-doc.md in "new-docs" folder.');
console.log("You can now write your article in this file.");
console.log();
console.log("To preview, run the following command:");
console.log("pnpm exec docusaurus start --config=new-article.config.js");
console.log();
console.log('Click on "Docs" afterwards to see your page.');
