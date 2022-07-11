import React from "react";
import Layout from "@theme/Layout";
import { LambdaHeader } from "../../../src/pages/about/LambdaHeader";
import { RenderTimes } from "../../../components/LambdaSplash/RenderTimes";
import { Disclaimers } from "../../../components/LambdaSplash/Disclaimers";
import Head from "@docusaurus/Head";
import { LambdaFast } from "../../../components/LambdaSplash/Fast";
import { LambdaEasy } from "../../../components/LambdaSplash/Easy";
import { BuildApps } from "../../../src/pages/about/BuildApps";
import { Header } from "../../../src/pages/about/images";
import { Header1 } from "../../../src/pages/about/images";
import { Header2 } from "../../../src/pages/about/images";
import { Header3 } from "../../../src/pages/about/images";

const container: React.CSSProperties = {
  maxWidth: 1000,
  margin: "auto",
  paddingLeft: 16,
  paddingRight: 16,
};

export default () => {
  return (
    <Layout>
      <br />
      <br />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Header />
      </div>
      <Head>
        <title>Remotion | About</title>
        <meta name="description" content="Remotion's story." />
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Header />
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {" "}
          <Header />
        </div>
        <br />
        <Header1 /> <Header2 /> <Header3 />
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
