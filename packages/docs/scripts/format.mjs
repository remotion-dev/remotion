import { promises as fs } from "fs";
import prettier from "prettier";

const files = await fs.readdir("./docs");

for (const file of files) {
  let content = await fs.readFile(`./docs/${file}`, "utf-8");

  content = content.replace(
    /```(tsx|ts)/gi,
    (_, type) => `\`\`\`${type === "tsx" ? "jsx" : "js"} %%`
  );
  content = prettier.format(content, {
    parser: "markdown",
  });
  content = content.replace(
    /```(jsx|js) %%/gi,
    (_, type) => `\`\`\`${type === "jsx" ? "tsx" : "ts"}`
  );

  await fs.writeFile(`./docs/${file}`, content);
}

console.log(`Formatted ${files.length} file${files.length === 1 ? "" : "s"}.`);
