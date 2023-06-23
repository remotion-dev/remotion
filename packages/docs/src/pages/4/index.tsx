import React from "react";
import Layout from "@theme/Layout";
import Head from "@docusaurus/Head";
import { Seo } from "../../components/Seo";

const v4: React.FC = () => {
  return (
    <Layout>
      <Head>{Seo.renderTitle("Remotion V4")}</Head>
    </Layout>
  );
};

export default v4;
