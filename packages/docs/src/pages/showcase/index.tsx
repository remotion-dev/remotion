import Layout from "@theme/Layout";
import clsx from "clsx";
import React, { useCallback, useMemo, useState } from "react";
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

const Showcase = () => {
  const [video, setVideo] = useState<ShowcaseVideo | null>(null);

  const currentIndex = useMemo(() => {
    if (video === null) {
      return -1;
    }

    return showcaseVideos.findIndex((v) => v.muxId === video.muxId);
  }, [video]);

  const hasNext = currentIndex < showcaseVideos.length - 1;
  const hasPrevious = currentIndex > 0;

  const goToNextVideo = useCallback(() => {
    if (!hasNext) {
      return;
    }

    setVideo(showcaseVideos[currentIndex + 1]);
  }, [currentIndex, hasNext]);

  const goToPreviousVideo = useCallback(() => {
    if (!hasPrevious) {
      return;
    }

    setVideo(showcaseVideos[currentIndex - 1]);
  }, [currentIndex, hasPrevious]);

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
      <VideoPlayer
        hasNext={hasNext}
        hasPrevious={hasPrevious}
        toNext={goToNextVideo}
        toPrevious={goToPreviousVideo}
        dismiss={dismiss}
        video={video}
      />

      <main>
        <section className={styles.videos}>
          <div className="container">
            <div className="row">
              {showcaseVideos.map((vid) => (
                <VideoPreview
                  key={vid.muxId}
                  onClick={() => {
                    setVideo(vid);
                  }}
                  {...vid}
                />
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
};

export default Showcase;
