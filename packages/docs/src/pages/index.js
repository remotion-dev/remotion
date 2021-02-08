import React from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";

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

function Feature({ imageUrl, title, description }) {
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
}

function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;
  return (
    <Layout
      title="Write videos in React"
      description="Create MP4 motion graphics in React. Leverage CSS, SVG, WebGL and more technologies to render videos programmatically!"
    >
      <header className={clsx("hero hero--primary", styles.heroBanner)}>
        <div className="container">
          <h1 className="hero__title" style={{ color: "white" }}>
            {siteConfig.title}
          </h1>
          <p className="hero__subtitle" style={{ color: "white" }}>
            {siteConfig.tagline}
          </p>
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
          <div className={styles.buttons}>
            <Link
              className={clsx(
                "button button--outline button--secondary button--lg",
                styles.getStarted
              )}
              style={{ color: "white" }}
              to={useBaseUrl("docs/")}
            >
              Get Started
            </Link>
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
      <div style={{ color: "white", fontSize: 14 }}>{props.text}</div>
    </div>
  );
}

export default Home;
