import { OpenAI } from "openai";

export const generateJSDocTask = async ({
  sourceContents,
  openai,
  contents,
  link,
}: {
  sourceContents: string;
  openai: OpenAI;
  contents: string;
  link: string;
}) => {
  const stream = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      {
        role: "system",
        content: [
          "You are going to be given an API source code and an API documentation, and a URL to use.",
          "Check if the function already has a JSDoc comment.",
          "If it does, respond only with 'OK'.",
          "If not, write a JSDoc comment for the function. Only write the JSDoc comment, don't reply anything else.",
          "Put the URL as the documentation.",
          "This is the right format for a JSDoc comment:\n",
          `
/**
 * @description Triggers a render on a lambda given a composition and a lambda function.
 * @see [Documentation](https://remotion.dev/docs/lambda/rendermediaonlambda)
 * @param params.functionName The name of the Lambda function that should be used
 * @param params.serveUrl The URL of the deployed project
 * @returns {Promise<RenderMediaOnLambdaOutput>} See documentation for detailed structure
 */
          `,
        ].join("\n"),
      },
      {
        role: "system",
        content: "This is the url to use:\n" + link,
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
