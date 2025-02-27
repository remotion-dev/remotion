import type { AwsRegion } from "@remotion/lambda";
import {
  renderMediaOnLambda,
  speculateFunctionName,
} from "@remotion/lambda/client";
import type { RenderResponse } from "./types";
import { CompositionProps, DISK, RAM, TIMEOUT } from "app/remotion/constants";
import { z } from "zod";

export const renderVideo = async ({
  serveUrl,
  composition,
  inputProps,
  outName,
  metadata,
}: {
  serveUrl: string;
  composition: string;
  inputProps: z.infer<typeof CompositionProps>;
  outName: string;
  metadata: Record<string, string> | null;
}): Promise<RenderResponse> => {
  const region = process.env.REMOTION_AWS_REGION as AwsRegion | undefined;
  if (!region) {
    throw new Error("REMOTION_AWS_REGION is not set");
  }

  const { renderId, bucketName } = await renderMediaOnLambda({
    region,
    functionName: speculateFunctionName({
      diskSizeInMb: DISK,
      memorySizeInMb: RAM,
      timeoutInSeconds: TIMEOUT,
    }),
    serveUrl,
    composition,
    inputProps,
    codec: "h264",
    downloadBehavior: {
      type: "download",
      fileName: outName,
    },
    metadata,
  });

  return {
    renderId,
    bucketName,
    functionName: speculateFunctionName({
      diskSizeInMb: DISK,
      memorySizeInMb: RAM,
      timeoutInSeconds: TIMEOUT,
    }),
    region,
  };
};
