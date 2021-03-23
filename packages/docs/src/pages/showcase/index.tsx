import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";
import splitbee from "@splitbee/web";
import Layout from "@theme/Layout";
import clsx from "clsx";
import React from "react";
import headerStyles from "./header.module.css";
import styles from "./styles.module.css";
import ReactPlayer from 'react-player';

setTimeout(() => {
  splitbee.init();
}, 100);

const videos = [
  {
    title: "Spotify Wrapped",
    videoUrl: "vid/showcase/1.mp4",
    imageUrl: "img/showcase/1.png",
    description: (
      <>
        A recreation of Spotify Wrapped where you can override all text and images via command line.
      </>
    ),
  },
  {
    title: "AnySticker In App Assets",
    videoUrl: "vid/showcase/2.mp4",
    imageUrl: "img/showcase/2.png",
    description: (
      <>
        This video will welcome users in the newest version of AnySticker.
      </>
    ),
  },
  {
    title: "Remotion Trailer",
    videoUrl: "vid/showcase/3.mp4",
    imageUrl: "img/showcase/3.png",
    description: (
      <>
        This video Welcome you to Remotion project.
      </>
    ),
  },
];

const Videos: React.FC<{
  videoUrl: string;
  imageUrl: string;
  title: string;
  description: JSX.Element;
}> = ({ videoUrl, imageUrl, title, description }) => {
  const vidUrl = useBaseUrl(videoUrl);
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={clsx("col col--4", styles.video)}>
      {vidUrl && (
        <div className="text--center">
          <ReactPlayer controls={true} light={imgUrl} width={'300px'} height={'200px'} loop={true}  url={vidUrl}/>
        </div>
      )}
      <h3 className={styles.videoTitle}>{title}</h3>
      <p>{description}</p>
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
        <p>
          Use your React knowledge to create real MP4 videos. Feel free to pull request your creations!
        </p>
      </div>
    </div>
  );
};

function Showcase() {
  return (
    <Layout
      title="Write videos in React"
      description="Create MP4 motion graphics in React. Leverage CSS, SVG, WebGL and more technologies to render videos programmatically!"
    >
      <header className={clsx("hero ", styles.heroBanner)}>
        <div className="container">
          <PageHeader />
        </div>
      </header>
      <main>
        {videos && videos.length > 0 && (
          <section className={styles.videos}>
            <div className="container">
              <div className="row">
                {videos.map((props, idx) => (
                    <Videos key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}


export default Showcase;
