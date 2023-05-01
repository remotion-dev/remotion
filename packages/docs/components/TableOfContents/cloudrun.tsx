import React from "react";
import { Grid } from "./Grid";
import { TOCItem } from "./TOCItem";

export const TableOfContents: React.FC = () => {
  return (
    <div>
      <Grid>
        {/* <TOCItem link="/docs/cloudrun/estimateprice">
          <strong>estimatePrice()</strong>
          <div>Estimate the price of a render</div>
        </TOCItem> */}
        <TOCItem link="/docs/cloudrun/deployservice">
          <strong>deployService()</strong>
          <div>Create a new service in GCP Cloud Run</div>
        </TOCItem>
        <TOCItem link="/docs/cloudrun/deleteservice">
          <strong>deleteService()</strong>
          <div>Delete a service in GCP Cloud Run</div>
        </TOCItem>
        <TOCItem link="/docs/cloudrun/getserviceinfo">
          <strong>getServiceInfo()</strong>
          <div>Gets information about a service</div>
        </TOCItem>
        <TOCItem link="/docs/cloudrun/getservices">
          <strong>getServices()</strong>
          <div>Lists available Remotion Cloud Run services</div>
        </TOCItem>
        <TOCItem link="/docs/cloudrun/getcompositionsoncloudrun">
          <strong>getCompositionsOnCloudrun()</strong>
          <div>Gets list of compositions inside a Cloud Run service</div>
        </TOCItem>
        <TOCItem link="/docs/cloudrun/deletesite">
          <strong>deleteSite()</strong>
          <div>Delete a bundle from S3</div>
        </TOCItem>
        <TOCItem link="/docs/cloudrun/deploysite">
          <strong>deploySite()</strong>
          <div>Bundle and upload a site to S3</div>
        </TOCItem>
        <TOCItem link="/docs/cloudrun/getawsclient">
          <strong>getAwsClient()</strong>
          <div>Access the AWS SDK directly</div>
        </TOCItem>
        <TOCItem link="/docs/cloudrun/getregions">
          <strong>getRegions()</strong>
          <div>Get all available regions</div>
        </TOCItem>
        <TOCItem link="/docs/cloudrun/getsites">
          <strong>getSites()</strong>
          <div>Get all available sites</div>
        </TOCItem>
        <TOCItem link="/docs/cloudrun/downloadmedia">
          <strong>downloadMedia()</strong>
          <div>Download a render artifact from S3</div>
        </TOCItem>
        <TOCItem link="/docs/cloudrun/getuserpolicy">
          <strong>getUserPolicy()</strong>
          <div>Get the policy JSON for your AWS user</div>
        </TOCItem>
        <TOCItem link="/docs/cloudrun/getrolepolicy">
          <strong>getRolePolicy()</strong>
          <div>Get the policy JSON for your AWS role</div>
        </TOCItem>
        <TOCItem link="/docs/cloudrun/getorcreatebucket">
          <strong>getOrCreateBucket()</strong>
          <div>Ensure a Remotion S3 bucket exists</div>
        </TOCItem>
        <TOCItem link="/docs/cloudrun/getrenderprogress">
          <strong>getRenderProgress()</strong>
          <div>Query the progress of a render</div>
        </TOCItem>
        <TOCItem link="/docs/cloudrun/presignurl">
          <strong>presignUrl()</strong>
          <div>Make a private file public to those with the link</div>
        </TOCItem>
        <TOCItem link="/docs/cloudrun/rendermediaoncloudrun">
          <strong>renderMediaOnCloudrun()</strong>
          <div>Trigger a video or audio render</div>
        </TOCItem>
        <TOCItem link="/docs/cloudrun/renderstilloncloudrun">
          <strong>renderStillOnCloudrun()</strong>
          <div>Trigger a still render</div>
        </TOCItem>
        <TOCItem link="/docs/cloudrun/simulatepermissions">
          <strong>simulatePermissions()</strong>
          <div>Ensure permissions are correctly set up</div>
        </TOCItem>
        <TOCItem link="/docs/cloudrun/speculateservicename">
          <strong>speculateServiceName()</strong>
          <div>Get the Cloud Run service name based on its configuration</div>
        </TOCItem>
        <TOCItem link="/docs/cloudrun/validatewebhooksignature">
          <strong>validateWebhookSignature()</strong>
          <div>Validate an incoming webhook request is authentic</div>
        </TOCItem>
      </Grid>
    </div>
  );
};
