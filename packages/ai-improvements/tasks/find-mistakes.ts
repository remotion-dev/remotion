import { OpenAI } from "openai";

export const findMistakes = async ({
  sourceContents,
  openai,
  contents,
}: {
  sourceContents: string;
  openai: OpenAI;
  contents: string;
}) => {
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
  let reply = "";
  for await (const chunk of stream) {
    reply += chunk.choices[0]?.delta?.content || "";
    process.stdout.write(chunk.choices[0]?.delta?.content || "");
  }

  return reply;
};
