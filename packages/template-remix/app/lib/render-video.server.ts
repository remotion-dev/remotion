import type { AwsRegion } from "@remotion/lambda";
import { renderMediaOnLambda } from "@remotion/lambda/client";
import { speculateFunctionName } from "./get-function-name";
import type { RenderResponse } from "./types";
import type { LogoAnimationProps } from "app/remotion/constants";

export const renderVideo = async ({
  serveUrl,
  composition,
  inputProps,
  outName,
  metadata,
}: {
  serveUrl: string;
  composition: string;
  inputProps: LogoAnimationProps;
  outName: string;
  metadata: Record<string, string> | null;
}): Promise<RenderResponse> => {
  const region = process.env.REMOTION_AWS_REGION as AwsRegion | undefined;
  if (!region) {
    throw new Error("REMOTION_AWS_REGION is not set");
  }

  const { renderId, bucketName } = await renderMediaOnLambda({
    region,
    functionName: speculateFunctionName(),
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
    functionName: speculateFunctionName(),
    region,
  };
};
