import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import splitbee from "@splitbee/web";
import Layout from "@theme/Layout";
import clsx from "clsx";
import React from "react";
import { PageHeader } from "./PageHeader";
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

function Home() {
  const context = useDocusaurusContext();
  return (
    <Layout
      title="Write videos in React"
      description="Create MP4 motion graphics in React. Leverage CSS, SVG, WebGL and more technologies to render videos programmatically!"
    >
      <header className={clsx("hero ", styles.heroBanner)}>
        <div className="container">
          <PageHeader></PageHeader>
          <br />
          <br />
          <br />
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
