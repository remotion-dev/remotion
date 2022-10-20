import type { VercelRequest, VercelResponse } from "@vercel/node";
import got from "got";

export const addToGroup = async ({
  groupId,
  email,
  apiKey,
  fields,
}: {
  groupId: string;
  email: string;
  apiKey: string;
  fields: Record<string, string>;
}) => {
  await got(`https://api.mailerlite.com/api/v2/groups/${groupId}/subscribers`, {
    method: "post",
    body: JSON.stringify({
      email,
      fields,
    }),
    headers: {
      "content-type": "application/json",
      "X-MailerLite-ApiKey": apiKey,
    },
  });
};

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== "POST") {
    response.status(405).json({
      success: false,
    });
    return;
  }
  await addToGroup({
    email: request.body.email,
    groupId: "69495249153558226",
    apiKey: process.env.MAILERLITE_KEY as string,
    fields: {},
  });
  response.status(200).json({
    success: true,
  });
}
