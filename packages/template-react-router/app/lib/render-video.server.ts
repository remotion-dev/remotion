import {
  renderMediaOnLambda,
  speculateFunctionName,
} from "@remotion/lambda/client";
import type { RenderResponse } from "./types";
import { z } from "zod";
import { CompositionProps } from "~/remotion/schemata";
import { DISK, RAM, REGION, TIMEOUT } from "~/remotion/constants.mjs";

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
  if (
    !process.env.AWS_ACCESS_KEY_ID &&
    !process.env.REMOTION_AWS_ACCESS_KEY_ID
  ) {
    throw new TypeError(
      "Set up Remotion Lambda to render videos. See the README.md for how to do so.",
    );
  }
  if (
    !process.env.AWS_SECRET_ACCESS_KEY &&
    !process.env.REMOTION_AWS_SECRET_ACCESS_KEY
  ) {
    throw new TypeError(
      "The environment variable REMOTION_AWS_SECRET_ACCESS_KEY is missing. Add it to your .env file.",
    );
  }

  const { renderId, bucketName } = await renderMediaOnLambda({
    region: REGION,
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
    region: REGION,
  };
};
