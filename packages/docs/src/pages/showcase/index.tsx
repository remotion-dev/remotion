import Layout from "@theme/Layout";
import clsx from "clsx";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { VideoPlayer } from "../../components/VideoPlayer";
import { VideoPreview } from "../../components/VideoPreview";
import { ShowcaseVideo, showcaseVideos } from "../../data/showcase-videos";
import { chunk } from "../../helpers/chunk";
import { useElementSize } from "../../helpers/use-el-size";
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

const flex1: React.CSSProperties = {
  flex: 1,
};

const Showcase = () => {
  const containerSize = useElementSize(
    typeof document === "undefined" ? null : document.body
  );
  const mobileLayout = (containerSize?.width ?? Infinity) < 1200;

  const [userHasInteractedWithPage, setUserHasInteractedWithPage] = useState(
    false
  );
  const [video, setVideo] = useState<ShowcaseVideo | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    if (!window.location.hash) {
      return null;
    }

    return (
      showcaseVideos.find(
        (v) => v.muxId === window.location.hash.replace("#", "")
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
        window.location.href.substr(0, window.location.href.indexOf("#"))
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
        display: "flex",
        flexDirection: "column",
        textAlign: "left",
      };
    }

    return {
      display: "flex",
      flexDirection: "row",
      textAlign: "left",
    };
  }, [mobileLayout]);

  const chunks = chunk(showcaseVideos, 3);

  return (
    <Layout
      title="Showcase"
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
        userHasInteractedWithPage={userHasInteractedWithPage}
      />

      <main>
        <section className={styles.videos}>
          <div className="container">
            {chunks.map((c) => {
              return (
                <div key={c.map((c_) => c_.muxId).join("")} style={layoutStyle}>
                  {c.map((vid) => {
                    return (
                      <div key={vid.muxId} style={flex1}>
                        <VideoPreview
                          onClick={() => {
                            setVideo(vid);
                            setUserHasInteractedWithPage(true);
                          }}
                          mobileLayout={mobileLayout}
                          {...vid}
                        />
                      </div>
                    );
                  })}
                  {c.length < 3 ? <div style={flex1} /> : null}
                  {c.length < 2 ? <div style={flex1} /> : null}
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
