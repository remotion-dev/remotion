import type { AwsRegion } from "@remotion/lambda";
import {
  deploySite,
  getOrCreateBucket,
  deployFunction,
} from "@remotion/lambda";
import dotenv from "dotenv";
import path from "path";
import { RAM, TIMEOUT, SITE_NAME } from "./remotion/constants";

dotenv.config();

const run = async () => {
  const region = process.env.REMOTION_AWS_REGION as AwsRegion;
  if (!region) {
    throw new Error("REMOTION_AWS_REGION is not set");
  }
  const { alreadyExisted, functionName } = await deployFunction({
    createCloudWatchLogGroup: true,
    memorySizeInMb: RAM,
    region,
    timeoutInSeconds: TIMEOUT,
  });
  console.log(
    `${alreadyExisted ? "Ensured" : "Deployed"} function "${functionName}"`,
  );

  const { bucketName } = await getOrCreateBucket({ region });
  const { serveUrl } = await deploySite({
    siteName: SITE_NAME,
    bucketName,
    entryPoint: path.join(process.cwd(), "app/remotion/index.ts"),
    region,
  });

  console.log(serveUrl);
};

run()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
