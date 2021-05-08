import Layout from "@theme/Layout";
import React from "react";
import styled from "styled-components";
import { LightningFastEditor } from "../../components/LandingPage/editor";
import { FreePricing } from "../../components/LandingPage/FreePricing";
import { IfYouKnowReact } from "../../components/LandingPage/if-you-know-react";
import { Parametrize } from "../../components/LandingPage/parametrize";
import { RealMP4Videos } from "../../components/LandingPage/real-mp4-videos";

const Title = styled.h1`
  font-size: 5em;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  font-weight: 700;
  line-height: 1;
  -webkit-text-fill-color: transparent;
  background: linear-gradient(
    to right,
    var(--text-color),
    var(--light-text-color)
  );
  -webkit-background-clip: text;
  width: 500px;
`;

const Content = styled.div`
  max-width: 1000px;
  margin: auto;
  padding-top: 10vh;
`;

const NewLanding: React.FC = () => {
  return (
    <Layout
      title="Write videos in React"
      description="Create MP4 motion graphics in React. Leverage CSS, SVG, WebGL and more technologies to render videos programmatically!"
    >
      <Content>
        <Title>
          Write videos <br /> in React.
        </Title>
        <p>
          Use your React knowledge to create real MP4 videos. <br /> Scale your
          video production using server-side rendering and parametrization.
        </p>
        <br />
        <br />
        <br />
        <br />
        <br />
        <IfYouKnowReact></IfYouKnowReact>
        <br />
        <br />
        <br />
        <br />
        <br />
        <RealMP4Videos></RealMP4Videos>
        <br />
        <br />
        <br />
        <br />
        <LightningFastEditor></LightningFastEditor>
        <br />
        <br />
        <br />
        <br />
        <Parametrize></Parametrize>
        <br />
        <br />
        <br />
        <br />
        <FreePricing></FreePricing>
      </Content>
    </Layout>
  );
};

export default NewLanding;
