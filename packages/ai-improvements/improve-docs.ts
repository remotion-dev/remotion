import path from "path";
import { articles } from "../docs/src/data/articles";
import { OpenAI } from "openai";
import { getApis } from "./map-over-api";

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

const apis = await getApis();

for (const api of apis) {
  const contents = await Bun.file(api.filePath).text();
  if (!api.sourceCodePath) {
    continue;
  }

  const flag = path.join(".done", api.id);

  if (await Bun.file(flag).exists()) {
    console.log(`Article ${api.title} already processed`);
    continue;
  }

  const file = path.join(process.cwd(), "..", "..", api.sourceCodePath);
  console.log(file);
  const sourceContents = await Bun.file(file).text();
  console.log(`Article ${api.title} contains source code`);

  const stream = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      {
        role: "system",
        content: [
          "You are going to be given an API and an API documentation.",
          "respond if you think the API documentation is missing parameters the user can pass or the return value is not right.",
          "Also point out typos.",
          "Do only point out obvious mistakes.",
          "Sometimes props are documented like ### `delayRenderRetries`<AvailableFrom v='4.0.140' />, which is fine",
          "Consider that the documentation may contain backticks and html tags, which are not mistakes.",
          "Point out if the markdown is not formatted correctly.",
          "Rewrite paragraphs and sentences that we need to correct.",
          "Otherwise, just say OK.",
        ].join("\n"),
      },
      {
        role: "user",
        content: "This is the source code for the API:\n" + sourceContents,
      },
      {
        role: "user",
        content: "This is the markdown of the documentation:\n" + contents,
      },
    ],
    stream: true,
  });
  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content || "");
  }
  await Bun.write(flag, "txt");
  process.exit(0);
}
