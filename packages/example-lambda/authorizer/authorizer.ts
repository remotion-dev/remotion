import { APIGatewayTokenAuthorizerHandler } from "aws-lambda";
const btoa = (str: string) => Buffer.from(str).toString("base64");

const compareTokenWithCredentials = (
  token: string,
  user: string,
  pass: string
) => token === `Basic ${btoa(`${user}:${pass}`)}`;

export const handler: APIGatewayTokenAuthorizerHandler = async (event) => {
  console.log("enter");
  const token = event.authorizationToken;
  let effect = "Deny";

  if (compareTokenWithCredentials(token, "user", "pass")) {
    effect = "Allow";
  }

  return {
    statusCode: 200,
    principalId: "user",
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: "*",
        },
      ],
    },
  };
};
