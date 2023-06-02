import React from "react";
import { Grid } from "./Grid";
import { TOCItem } from "./TOCItem";

export const TableOfContents: React.FC = () => {
  return (
    <div>
      <Grid>
        <TOCItem link="/docs/cloudrun/getserviceinfo">
          <strong>getServiceInfo()</strong>
          <div>Gets information about a service</div>
        </TOCItem>
        <TOCItem link="/docs/cloudrun/deployservice">
          <strong>deployService()</strong>
          <div>Create a new service in GCP Cloud Run</div>
        </TOCItem>
        <TOCItem link="/docs/cloudrun/deleteservice">
          <strong>deleteService()</strong>
          <div>Delete a service in GCP Cloud Run</div>
        </TOCItem>
        <TOCItem link="/docs/cloudrun/getservices">
          <strong>getServices()</strong>
          <div>Lists available Remotion Cloud Run services</div>
        </TOCItem>
        <TOCItem link="/docs/cloudrun/speculateservicename">
          <strong>speculateServiceName()</strong>
          <div>Speculate a service name based on its configuration</div>
        </TOCItem>
        <TOCItem link="/docs/cloudrun/getregions">
          <strong>getRegions()</strong>
          <div>Get all available regions</div>
        </TOCItem>
        <TOCItem link="/docs/cloudrun/deploysite">
          <strong>deploySite()</strong>
          <div>Bundle and upload a site to Cloud Storage</div>
        </TOCItem>
        <TOCItem link="/docs/cloudrun/deletesite">
          <strong>deleteSite()</strong>
          <div>Delete a bundle from Cloud Storage</div>
        </TOCItem>
        <TOCItem link="/docs/cloudrun/getsites">
          <strong>getSites()</strong>
          <div>Get all available sites from Cloud Storage</div>
        </TOCItem>
        <TOCItem link="/docs/cloudrun/getorcreatebucket">
          <strong>getOrCreateBucket()</strong>
          <div>Ensure a Remotion Cloud Storage bucket exists</div>
        </TOCItem>
        <TOCItem link="/docs/cloudrun/rendermediaoncloudrun">
          <strong>renderMediaOnCloudrun()</strong>
          <div>Trigger a video or audio render</div>
        </TOCItem>
        <TOCItem link="/docs/cloudrun/renderstilloncloudrun">
          <strong>renderStillOnCloudrun()</strong>
          <div>Trigger a still render</div>
        </TOCItem>
        <TOCItem link="/docs/cloudrun/testpermissions">
          <strong>testPermissions()</strong>
          <div>Ensure permissions are correctly set up in GCP</div>
        </TOCItem>
      </Grid>
    </div>
  );
};
