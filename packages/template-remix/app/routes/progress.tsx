import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { AwsRegion } from "@remotion/lambda";
import { getRenderProgress } from "@remotion/lambda/client";
import { speculateFunctionName } from "app/lib/get-function-name";
import type { StatusResponse } from "../lib/types";

export const action: ActionFunction = async ({ request }) => {
  const body = await request.formData();
  const renderId = body.get("renderId") as string;
  const bucketName = body.get("bucketName") as string;
  if (!renderId) {
    throw new Response(JSON.stringify({ error: "No renderId" }), {
      status: 400,
    });
  }
  if (!bucketName) {
    throw new Response(JSON.stringify({ error: "No bucketName" }), {
      status: 400,
    });
  }

  const region = process.env.REMOTION_AWS_REGION as AwsRegion | undefined;
  if (!region) {
    throw new Error("REMOTION_AWS_REGION is not set");
  }

  const { done, overallProgress, errors, outputFile } = await getRenderProgress(
    {
      renderId,
      bucketName,
      functionName: speculateFunctionName(),
      region,
    },
  );
  const status: StatusResponse = {
    renderId,
    done,
    overallProgress,
    errors,
    outputFile,
  };

  return json(status);
};
