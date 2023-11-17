import Head from "@docusaurus/Head";
import Layout from "@theme/Layout";
import clsx from "clsx";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { VideoPlayer } from "../../components/VideoPlayer";
import { VideoPreview } from "../../components/VideoPreview";
import type { ShowcaseVideo } from "../../data/showcase-videos";
import {
  showcaseVideos,
  shuffledShowcaseVideos,
} from "../../data/showcase-videos";
import { useMobileLayout } from "../../helpers/mobile-layout";
import headerStyles from "./header.module.css";
import styles from "./styles.module.css";

const PageHeader: React.FC = () => {
  return (
    <div className={headerStyles.row}>
      <div style={{ flex: 1 }}>
        <h1 className={headerStyles.title}>Showcase</h1>
        <p>
          Some awesome creations from the community, many with source code. Have
          you made your own video with Remotion?{" "}
          <a href="/showcase/add">Add it to the showcase!</a>
        </p>
      </div>
    </div>
  );
};

const container: React.CSSProperties = {
  maxWidth: "var(--ifm-container-width)",
  width: "100%",
  margin: "auto",
  marginTop: 50,
  paddingLeft: 20,
  paddingRight: 20,
};

const Showcase = () => {
  const mobileLayout = useMobileLayout();

  const [userHasInteractedWithPage, setUserHasInteractedWithPage] =
    useState(false);
  const [video, setVideo] = useState<ShowcaseVideo | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    if (!window.location.hash) {
      return null;
    }

    return (
      showcaseVideos.find(
        (v) => v.muxId === window.location.hash.replace("#", ""),
      ) ?? null
    );
  });

  const currentIndex = useMemo(() => {
    if (video === null) {
      return -1;
    }

    return showcaseVideos.findIndex((v) => v.muxId === video.muxId);
  }, [video]);

  useEffect(() => {
    if (video) {
      window.location.hash = video.muxId;
    } else if (window.location.href.includes("#")) {
      window.history.replaceState(
        {},
        document.title,
        window.location.href.substr(0, window.location.href.indexOf("#")),
      );
    }
  }, [video]);

  const hasNext = currentIndex < showcaseVideos.length - 1;
  const hasPrevious = currentIndex > 0;

  const goToNextVideo = useCallback(() => {
    if (!hasNext) {
      return;
    }

    setVideo(showcaseVideos[currentIndex + 1]);
    setUserHasInteractedWithPage(true);
  }, [currentIndex, hasNext]);

  const goToPreviousVideo = useCallback(() => {
    if (!hasPrevious) {
      return;
    }

    setVideo(showcaseVideos[currentIndex - 1]);
    setUserHasInteractedWithPage(true);
  }, [currentIndex, hasPrevious]);

  const dismiss = useCallback(() => {
    setVideo(null);
  }, []);

  const layoutStyle: React.CSSProperties = useMemo(() => {
    if (mobileLayout) {
      return {
        width: "100%",
        marginBottom: 20,
      };
    }

    return {
      display: "inline-block",
      width: "100%",
    };
  }, [mobileLayout]);

  return (
    <Layout>
      <Head>
        <title>Showcase</title>
        <meta name="og:image" content="/img/showcase.png" />
        <meta name="twitter:image" content="/img/showcase.png" />
        <meta property="og:image" content="/img/showcase.png" />
        <meta property="twitter:image" content="/img/showcase.png" />
      </Head>
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
        userHasInteractedWithPage={userHasInteractedWithPage}
      />

      <main>
        <section className={styles.videos}>
          <div className={styles.container} style={container}>
            {shuffledShowcaseVideos.map((vid) => {
              return (
                // eslint-disable-next-line react/jsx-key
                <div style={layoutStyle}>
                  <VideoPreview
                    onClick={() => {
                      setVideo(vid);
                      setUserHasInteractedWithPage(true);
                    }}
                    {...vid}
                  />
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </Layout>
  );
};

export default Showcase;
