import {
  speculateFunctionName,
  AwsRegion,
  getRenderProgress,
} from "@remotion/lambda/client";
import { DISK, RAM, REGION, TIMEOUT } from "../../../../config.mjs";
import { executeApi } from "../../../helpers/api-response";
import { ProgressResponse, ProgressRequest } from "../../../../types/schema";

const progress = executeApi<ProgressResponse, typeof ProgressRequest>(
  ProgressRequest,
  async (req, body) => {
    if (req.method !== "POST") {
      throw new Error("Only POST requests are allowed");
    }

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

export default progress;
