import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import splitbee from "@splitbee/web";
import Layout from "@theme/Layout";
import TabItem from "@theme/TabItem";
import Tabs from "@theme/Tabs";
import clsx from "clsx";
import React, { useState } from "react";
import headerStyles from "./header.module.css";
import styles from "./styles.module.css";

setTimeout(() => {
  splitbee.init();
}, 100);

const features = [
  {
    title: "Leverage the web",
    imageUrl: "img/wordcloud.png",
    description: (
      <>
        You've seen magic being created using CSS, Canvas, SVG and WebGL – why
        not use these powerful technologies for making videos?
      </>
    ),
  },
  {
    title: "Leverage React",
    imageUrl: "img/leverage-react.png",
    description: (
      <>
        Instead of copy & paste and undo & redo, use React's powerful
        composition model to reuse components and fix mistakes later.
      </>
    ),
  },
  {
    title: "Programmatic videos",
    imageUrl: "img/programmatic.png",
    description: (
      <>
        Use programming to create more advanced visualizations.{" "}
        <code>fetch</code> data from an API and render videos dynamically using
        SSR.
      </>
    ),
  },
];

const Feature: React.FC<{
  imageUrl: string;
  title: string;
  description: JSX.Element;
}> = ({ imageUrl, title, description }) => {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={clsx("col col--4", styles.feature)}>
      {imgUrl && (
        <div className="text--center">
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};

const Snippet: React.FC<{
  snippetValue: string;
}> = ({ snippetValue }) => {
  const [copied, setCopied] = useState(false);
  return (
    <div className={styles.snippet}>
      <div className={styles.snippetValue}>$ {snippetValue}</div>
      <div
        className={styles.copySnippet}
        onClick={() => {
          navigator.clipboard.writeText(snippetValue);
          setCopied(true);
        }}
      >
        {copied ? "Copied!" : "Copy"}
      </div>
    </div>
  );
};

const PageHeader: React.FC = () => {
  return (
    <div className={headerStyles.row}>
      <div style={{ flex: 1 }}>
        <h1 className={headerStyles.title}>
          Write videos programmatically in React
        </h1>
        <p style={{ marginBottom: 0 }}>
          Use your React knowledge to create real MP4 videos. Render videos
          dynamically using server-side rendering and parametrization.
        </p>
        <Tabs
          className={headerStyles.tabContainer}
          defaultValue="npm"
          values={[
            { label: "NPM", value: "npm" },
            { label: "Yarn", value: "yarn" },
          ]}
        >
          <TabItem value="npm">
            <Snippet snippetValue={"npm init video"} />
          </TabItem>

          <TabItem value="yarn">
            <Snippet snippetValue={"yarn create video"} />
          </TabItem>
        </Tabs>
      </div>
      <div style={{ width: 20 }}></div>
      <iframe
        style={{
          width: 560,
          height: 315,
          maxWidth: "100%",
        }}
        className={headerStyles.youtubeIframe}
        src="https://www.youtube.com/embed/gwlDorikqgY"
        title="Remotion - Create videos programmatically in React"
        frameBorder="0"
        allow="autoplay"
        allowFullScreen
      />
    </div>
  );
};

function Home() {
  return (
    <Layout
      title="Write videos in React"
      description="Create MP4 motion graphics in React. Leverage CSS, SVG, WebGL and more technologies to render videos programmatically!"
    >
      <header className={clsx("hero ", styles.heroBanner)}>
        <div className="container">
          <PageHeader />

          <br />
          <div>
            <StartPageExplainer
              img="img/vscode.png"
              text="Write your videos using React 17 and Typescript."
            />
            <StartPageExplainer
              img="img/editor.png"
              text="Preview your video in the browser with Fast Refresh and Timeline."
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 50,
            }}
          >
            <div className={styles.buttons}>
              <Link
                className={clsx(
                  "button button--outline button--secondary button--lg",
                  styles.getStarted
                )}
                to={useBaseUrl("docs/")}
              >
                Get Started
              </Link>
            </div>
            <div style={{ width: 8 }}></div>
          </div>
        </div>
      </header>
      <main>
        {features && features.length > 0 && (
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}

function StartPageExplainer(props) {
  return (
    <div style={{ display: "inline-block", textAlign: "center" }}>
      <img
        src={props.img}
        alt="Screenshot Remotion Player"
        style={{ maxHeight: 400 }}
      />
      <br />
      <div style={{ fontSize: 14 }}>{props.text}</div>
    </div>
  );
}

export default Home;
