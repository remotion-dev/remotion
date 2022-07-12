import React from "react";
import Layout from "@theme/Layout";
import { AboutUsHeader } from "./AboutUsHeader";

import Head from "@docusaurus/Head";
import { TitleTeamCards } from "./TitleTeamCards";

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
        <AboutUsHeader />
        <br />
        <TitleTeamCards />
        <br />
      </div>
    </Layout>
  );
};
