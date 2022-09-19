import React from "react";
import { Grid } from "./Grid";
import { TOCItem } from "./TOCItem";

export const TableOfContents: React.FC = () => {
  return (
    <div>
      <Grid>
        <TOCItem link="/docs/lambda/estimate-price">
          <strong>estimatePrice()</strong>
          <div>Estimate the price of a render</div>
        </TOCItem>
        <TOCItem link="/docs/lambda/deploy-function">
          <strong>deployFunction()</strong>
          <div>Create a new function in AWS Lambda</div>
        </TOCItem>
        <TOCItem link="/docs/lambda/delete-function">
          <strong>deleteFunction()</strong>
          <div>Delete a function in AWS Lambda</div>
        </TOCItem>
        <TOCItem link="/docs/lambda/get-function-info">
          <strong>getFunctionInfo()</strong>
          <div>Gets information about a function</div>
        </TOCItem>
        <TOCItem link="/docs/lambda/get-functions">
          <strong>getFunctions()</strong>
          <div>Lists available Remotion Lambda functions</div>
        </TOCItem>
        <TOCItem link="/docs/lambda/delete-site">
          <strong>deleteSite()</strong>
          <div>Delete a bundle from S3</div>
        </TOCItem>
        <TOCItem link="/docs/lambda/deploy-site">
          <strong>deploySite()</strong>
          <div>Bundle and upload a site to S3</div>
        </TOCItem>
        <TOCItem link="/docs/lambda/get-aws-client">
          <strong>getAwsClient()</strong>
          <div>Access the AWS SDK directly</div>
        </TOCItem>
        <TOCItem link="/docs/lambda/get-regions">
          <strong>getRegions()</strong>
          <div>Get all available regions</div>
        </TOCItem>
        <TOCItem link="/docs/lambda/get-sites">
          <strong>getSites()</strong>
          <div>Get all available sites</div>
        </TOCItem>
        <TOCItem link="/docs/lambda/download-media">
          <strong>downloadMedia()</strong>
          <div>Download a render artifact from S3</div>
        </TOCItem>
        <TOCItem link="/docs/lambda/get-user-policy">
          <strong>getUserPolicy()</strong>
          <div>Get the policy JSON for your AWS user</div>
        </TOCItem>
        <TOCItem link="/docs/lambda/get-role-policy">
          <strong>getRolePolicy()</strong>
          <div>Get the policy JSON for your AWS role</div>
        </TOCItem>
        <TOCItem link="/docs/lambda/get-or-create-bucket">
          <strong>getOrCreateBucket()</strong>
          <div>Ensure a Remotion S3 bucket exists</div>
        </TOCItem>
        <TOCItem link="/docs/lambda/get-render-progress">
          <strong>getRenderProgress()</strong>
          <div>Query the progress of a render</div>
        </TOCItem>
        <TOCItem link="/docs/lambda/presign-url">
          <strong>presignUrl()</strong>
          <div>Make a private file public to those with the link</div>
        </TOCItem>
        <TOCItem link="/docs/lambda/render-media-on-lambda">
          <strong>renderMediaOnLambda()</strong>
          <div>Trigger a video or audio render</div>
        </TOCItem>
        <TOCItem link="/docs/lambda/render-still-on-lambda">
          <strong>renderStillOnLambda()</strong>
          <div>Trigger a still render</div>
        </TOCItem>
        <TOCItem link="/docs/lambda/simulate-permissions">
          <strong>simulatePermissions()</strong>
          <div>Ensure permissions are correctly set up</div>
        </TOCItem>
      </Grid>
    </div>
  );
};
