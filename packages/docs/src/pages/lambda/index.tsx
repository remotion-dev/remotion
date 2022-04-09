import React from "react";
import Layout from "@theme/Layout";
import { LambdaHeader } from "../../../components/LambdaSplash/LambdaHeader";
import { RenderTimes } from "../../../components/LambdaSplash/RenderTimes";
import { Disclaimers } from "../../../components/LambdaSplash/Disclaimers";
import Head from "@docusaurus/Head";

const container: React.CSSProperties = {
  maxWidth: 1000,
  margin: "auto",
  paddingLeft: 16,
  paddingRight: 16,
};

export default () => {
  return (
    <Layout
      title="@remotion/lambda"
      description="Render videos at scale on AWS Lambda"
    >
      <Head>
        <meta name="og:image" content="/img/lambda-og.png" />
        <meta name="twitter:image" content="/img/lambda-og.png" />
        <meta property="og:image" content="/img/lambda-og.png" />
        <meta property="twitter:image" content="/img/lambda-og.png" />
      </Head>
      <div style={container}>
        <br />
        <br />
        <br />
        <LambdaHeader />
        <br />
        <br />
        <br />
        <div>
          <RenderTimes />
        </div>
        <div>
          <Disclaimers />
        </div>
      </div>
    </Layout>
  );
};
