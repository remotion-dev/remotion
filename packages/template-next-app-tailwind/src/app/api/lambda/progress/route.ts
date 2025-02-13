import {
  speculateFunctionName,
  AwsRegion,
  getRenderProgress,
} from "@remotion/lambda/client";
import { TIMEOUT } from "dns";
import { DISK, RAM, REGION } from "../../../../../config.mjs";
import { ProgressResponse, ProgressRequest } from "../../../../../types/schema";
import { executeApi } from "../../../../helpers/api-response";

export const POST = executeApi<ProgressResponse, typeof ProgressRequest>(
  ProgressRequest,
  async (req, body) => {
    const renderProgress = await getRenderProgress({
      bucketName: body.bucketName,
      functionName: speculateFunctionName({
        diskSizeInMb: DISK,
        memorySizeInMb: RAM,
        timeoutInSeconds: TIMEOUT,
      }),
      region: REGION as AwsRegion,
      renderId: body.id,
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
