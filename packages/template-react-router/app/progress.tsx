import {
  getRenderProgress,
  speculateFunctionName,
} from "@remotion/lambda/client";
import { ActionFunction } from "react-router";
import { errorAsJson } from "./lib/return-error-as-json";
import { ProgressRequest, ProgressResponse } from "./remotion/schemata";
import { DISK, RAM, REGION, TIMEOUT } from "./remotion/constants.mjs";

export const action: ActionFunction = errorAsJson(
  async ({ request }): Promise<ProgressResponse> => {
    const body = await request.json();
    const { bucketName, id } = ProgressRequest.parse(body);

    const renderProgress = await getRenderProgress({
      renderId: id,
      bucketName,
      functionName: speculateFunctionName({
        diskSizeInMb: DISK,
        memorySizeInMb: RAM,
        timeoutInSeconds: TIMEOUT,
      }),
      region: REGION,
    });
    if (renderProgress.fatalErrorEncountered) {
      return {
        type: "error",
        message: renderProgress.errors[0].message,
      };
    }

    if (renderProgress.done) {
      return {
        type: "done",
        url: renderProgress.outputFile as string,
        size: renderProgress.outputSizeInBytes as number,
      };
    }

    return {
      type: "progress",
      progress: Math.max(0.03, renderProgress.overallProgress),
    };
  },
);
