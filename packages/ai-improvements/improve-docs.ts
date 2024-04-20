import path from "path";
import { articles } from "../docs/src/data/articles";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

for (const article of articles) {
  const filePath = path.join(
    path.join(process.cwd(), "..", "docs", article.relativePath)
  );
  const contents = await Bun.file(filePath).text();
  const containsSourceCode = contents
    .toLowerCase()
    .includes("source code for ");

  if (containsSourceCode) {
    const match = contents.match(/\[.*source code for.*\]\((.*)\)/i);
    if (!match) {
      console.error(`Could not find source code for article ${article.title}`);
      continue;
    }
    const url = match[1];
    const p = url.replace(
      "https://github.com/remotion-dev/remotion/blob/main/",
      ""
    );
    const flag = path.join(".done", article.id);

    if (await Bun.file(flag).exists()) {
      console.log(`Article ${article.title} already processed`);
      continue;
    }

    const file = path.join(process.cwd(), "..", "..", p);
    console.log(file);
    const sourceContents = await Bun.file(file).text();
    console.log(`Article ${article.title} contains source code`);

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
}
