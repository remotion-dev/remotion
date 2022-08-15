import Layout from "@theme/Layout";
import React from "react";
import { experts } from "./data";

const Experts: React.FC = () => {
  return (
    <Layout>
      <div>
        {experts.map((e) => {
          return <div key={e.name}>{e.name}</div>;
        })}
      </div>
    </Layout>
  );
};

export default Experts;
