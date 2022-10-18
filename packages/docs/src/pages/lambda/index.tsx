import React from "react";
import Layout from "@theme/Layout";
import { LambdaHeader } from "../../../components/LambdaSplash/LambdaHeader";
import { RenderTimes } from "../../../components/LambdaSplash/RenderTimes";
import { Disclaimers } from "../../../components/LambdaSplash/Disclaimers";
import Head from "@docusaurus/Head";
import { LambdaFast } from "../../../components/LambdaSplash/Fast";
import { LambdaEasy } from "../../../components/LambdaSplash/Easy";
import { BuildApps } from "../../../components/LambdaSplash/BuildApps";

const container: React.CSSProperties = {
  maxWidth: 1000,
  margin: "auto",
  paddingLeft: 16,
  paddingRight: 16,
};

export default () => {
  return (
    <Layout>
      <Head>
        <title>Remotion Lambda - A distributed video renderer</title>
        <meta
          name="description"
          content="Render Remotion videos fast and at scale on AWS Lambda."
        />
        <meta name="og:image" content="/img/lambda-og.png" />
        <meta name="twitter:image" content="/img/lambda-og.png" />
        <meta property="og:image" content="/img/lambda-og.png" />
        <meta property="twitter:image" content="/img/lambda-og.png" />
      </Head>
      <div style={container}>
        <br />
        <br />
        <LambdaHeader />
        <br />
        <br />
        <div>
          <RenderTimes />
        </div>
        <br />
        <div>
          <LambdaFast />
          <br />
          <LambdaEasy />
        </div>

        <BuildApps />
        <div>
          <Disclaimers />
        </div>
      </div>
    </Layout>
  );
};
