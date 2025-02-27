import {
  deploySite,
  getOrCreateBucket,
  deployFunction,
} from "@remotion/lambda";
import dotenv from "dotenv";
import path from "path";
import { RAM, TIMEOUT, SITE_NAME, DISK } from "./app/remotion/constants.mjs";

dotenv.config();

const region = process.env.REMOTION_AWS_REGION;
if (!region) {
  throw new Error("REMOTION_AWS_REGION is not set");
}

if (!process.env.AWS_ACCESS_KEY_ID && !process.env.REMOTION_AWS_ACCESS_KEY_ID) {
  console.log(
    'The environment variable "REMOTION_AWS_ACCESS_KEY_ID" is not set.',
  );
  console.log("Lambda renders were not set up.");
  console.log(
    "Complete the Lambda setup: at https://www.remotion.dev/docs/lambda/setup",
  );
  process.exit(0);
}
if (
  !process.env.AWS_SECRET_ACCESS_KEY &&
  !process.env.REMOTION_AWS_SECRET_ACCESS_KEY
) {
  console.log(
    'The environment variable "REMOTION_REMOTION_AWS_SECRET_ACCESS_KEY" is not set.',
  );
  console.log("Lambda renders were not set up.");
  console.log(
    "Complete the Lambda setup: at https://www.remotion.dev/docs/lambda/setup",
  );
  process.exit(0);
}

const { alreadyExisted, functionName } = await deployFunction({
  createCloudWatchLogGroup: true,
  memorySizeInMb: RAM,
  region,
  diskSizeInMb: DISK,
  timeoutInSeconds: TIMEOUT,
  logLevel: "verbose",
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
