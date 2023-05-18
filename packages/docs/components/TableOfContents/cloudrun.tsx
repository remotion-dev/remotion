import React from "react";
import { Grid } from "./Grid";
import { TOCItem } from "./TOCItem";

export const TableOfContents: React.FC = () => {
  return (
    <div>
      <Grid>
        <TOCItem link="/docs/cloudrun/deployservice">
          <strong>deployService()</strong>
          <div>Create a new service in GCP Cloud Run</div>
        </TOCItem>
        <TOCItem link="/docs/cloudrun/getserviceinfo">
          <strong>getServiceInfo()</strong>
          <div>Gets information about a service</div>
        </TOCItem>
        <TOCItem link="/docs/cloudrun/getservices">
          <strong>getServices()</strong>
          <div>Lists available Remotion Cloud Run services</div>
        </TOCItem>
        <TOCItem link="/docs/cloudrun/getregions">
          <strong>getRegions()</strong>
          <div>Get all available regions</div>
        </TOCItem>
      </Grid>
    </div>
  );
};
