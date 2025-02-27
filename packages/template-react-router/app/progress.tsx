import type { AwsRegion } from "@remotion/lambda";
import {
  getRenderProgress,
  speculateFunctionName,
} from "@remotion/lambda/client";
import type { StatusResponse } from "./lib/types";
import { ActionFunction } from "react-router";
import { errorAsJson } from "./lib/return-error-as-json";
import { ProgressRequest } from "./remotion/schemata";
import { DISK, RAM, TIMEOUT } from "./remotion/constants.mjs";

export const action: ActionFunction = errorAsJson(async ({ request }) => {
  const body = await request.json();
  const { bucketName, id } = ProgressRequest.parse(body);

  const region = process.env.REMOTION_AWS_REGION as AwsRegion | undefined;
  if (!region) {
    throw new Error("REMOTION_AWS_REGION is not set");
  }

  const { done, overallProgress, errors, outputFile } = await getRenderProgress(
    {
      renderId: id,
      bucketName,
      functionName: speculateFunctionName({
        diskSizeInMb: DISK,
        memorySizeInMb: RAM,
        timeoutInSeconds: TIMEOUT,
      }),
      region,
    },
  );
  const status: StatusResponse = {
    renderId: id,
    done,
    overallProgress,
    errors,
    outputFile,
  };

  return status;
});
