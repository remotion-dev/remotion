import Layout from "@theme/Layout";
import clsx from "clsx";
import React, { useCallback, useState } from "react";
import { VideoPlayer } from "../../components/VideoPlayer";
import { VideoPreview } from "../../components/VideoPreview";
import { ShowcaseVideo, showcaseVideos } from "../../data/showcase-videos";
import headerStyles from "./header.module.css";
import styles from "./styles.module.css";

const PageHeader: React.FC = () => {
  return (
    <div className={headerStyles.row}>
      <div style={{ flex: 1 }}>
        <h1 className={headerStyles.title}>Showcase</h1>
        <p>
          Use your React knowledge to create real MP4 videos. Feel free to pull
          request your creations!
        </p>
      </div>
    </div>
  );
};

function Showcase() {
  const [video, setVideo] = useState<ShowcaseVideo | null>(null);

  const dismiss = useCallback(() => {
    setVideo(null);
  }, []);

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
      <VideoPlayer dismiss={dismiss} video={video}></VideoPlayer>

      <main>
        <section className={styles.videos}>
          <div className="container">
            <div className="row">
              {showcaseVideos.map((video, idx) => (
                <VideoPreview
                  onClick={() => {
                    setVideo(video);
                  }}
                  key={idx}
                  {...video}
                />
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export default Showcase;
