import { Handler } from "aws-lambda";
import { renderMediaOnLambda } from "@remotion/lambda/client";

export const handler: Handler = async (event: any = {}): Promise<any> => {
  const { bucketName, renderId } = await renderMediaOnLambda({
    region: "us-east-1",
    functionName: "remotion-render-bds9aab",
    composition: "MyVideo",
    serveUrl:
      "https://remotionlambda-qg35eyp1s1.s3.eu-central-1.amazonaws.com/sites/bf2jrbfkw",
    codec: "h264",
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      isSuccess: true,
      bucketName,
      renderId,
    }),
  };
};
