/* eslint-disable @typescript-eslint/require-await */
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { renderMediaOnLambda } from "@remotion/lambda/client";
export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  try {
    const { bucketName, renderId } = await renderMediaOnLambda({
      region: "us-east-1",
      functionName: "remotion-render-bds9aab",
      composition: "MyVideo",
      serveUrl:
        "https://remotionlambda-qg35eyp1s1.s3.eu-central-1.amazonaws.com/sites/bf2jrbfkw",
      codec: "h264",
    });

    return {
      body: JSON.stringify({ isSuccess: true, bucketName, renderId }),
      statusCode: 200,
    };
  } catch (ex) {
    return {
      body: JSON.stringify({ isSuccess: false, ex }),
      statusCode: 400,
    };
  }
}
