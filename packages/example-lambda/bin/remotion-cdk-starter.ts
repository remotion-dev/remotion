#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { RemotionLambdaStarterStack } from "../lib/remotion-cdk-starter-stack";

const app = new cdk.App();
new RemotionLambdaStarterStack(app, "remotion-cdk-stack", {
  stackName: "remotion-cdk-stack",
  env: {
    region: process.env.CDK_DEFAULT_REGION,
    account: process.env.CDK_DEFAULT_ACCOUNT,
  },
});
