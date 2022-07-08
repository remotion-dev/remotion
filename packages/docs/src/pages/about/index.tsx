import React from "react";
import Layout from "@theme/Layout";
import { LambdaHeader } from "../../../src/pages/about/LambdaHeader";
import { RenderTimes } from "../../../components/LambdaSplash/RenderTimes";
import { Disclaimers } from "../../../components/LambdaSplash/Disclaimers";
import Head from "@docusaurus/Head";
import { LambdaFast } from "../../../components/LambdaSplash/Fast";
import { LambdaEasy } from "../../../components/LambdaSplash/Easy";
import { BuildApps } from "../../../components/LambdaSplash/BuildApps";
import { Header } from "../../../src/pages/about/images"
import { Header1 } from "../../../src/pages/about/images"
import { Header2 } from "../../../src/pages/about/images"
import { Header3 } from "../../../src/pages/about/images"

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
        <title>Remotion | About</title>
        <meta
          name="description"
          content="Remotion's story."
        />
        <meta name="og:image" content="/img/lambda-og.png" />
        <meta name="twitter:image" content="/img/lambda-og.png" />
        <meta property="og:image" content="/img/lambda-og.png" />
        <meta property="twitter:image" content="/img/lambda-og.png" />
      </Head>
      <div style={container}>
        <br />
        <Header />
      </div>
      <div>
        <br />
        <LambdaHeader />

        <div>
          <Header/> 
        </div>

        <div>
          <Header1 /> <Header2 /> <Header3 />
        </div>

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
