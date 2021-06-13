import Hls from "hls.js";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ShowcaseVideo } from "../data/showcase-videos";
import { useElementSize } from "../helpers/use-el-size";
import { Spinner } from "./Spinner";
import { VideoSidebar } from "./VideoSidebar";

const videoCss: React.CSSProperties = {
  marginBottom: 0,
  backgroundColor: "white",
};

const RESERVED_FOR_SIDEBAR = 300;

const sidebar: React.CSSProperties = {
  width: RESERVED_FOR_SIDEBAR,
};

const spinner: React.CSSProperties = {
  height: 16,
  width: 16,
};

const loadingContainer: React.CSSProperties = {
  position: "absolute",
  justifyContent: "center",
  alignItems: "center",
  display: "flex",
};

export const PAGINATE_ICON_WIDTH = 24;
export const PAGINATE_ICON_PADDING = 20;
export const PAGINATE_BUTTONS_WIDTH =
  (PAGINATE_ICON_WIDTH + PAGINATE_ICON_PADDING * 2) * 2;

const getVideoToPlayUrl = (video: ShowcaseVideo) => {
  if (video.type === "mux_video") {
    return `https://stream.mux.com/${video.muxId}.m3u8`;
  }

  throw new Error("no url");
};

export const VideoPlayerContent: React.FC<{ video: ShowcaseVideo }> = ({
  video,
}) => {
  const [loaded, setLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const vidUrl = getVideoToPlayUrl(video);

  const containerSize = useElementSize(
    typeof document === "undefined" ? null : document.body
  );
  const mobileLayout = (containerSize?.width ?? Infinity) < 900;

  const possibleVideoWidth = mobileLayout
    ? containerSize?.width
    : Math.min(containerSize?.width ?? 0, 1200) -
      (mobileLayout ? 0 : RESERVED_FOR_SIDEBAR) -
      (mobileLayout ? 0 : PAGINATE_BUTTONS_WIDTH);
  const containerHeight = mobileLayout
    ? Infinity
    : Math.min(containerSize?.height ?? 0, 800);

  const heightRatio = (containerHeight ?? 0) / video.height;
  const widthRatio = (possibleVideoWidth ?? 0) / video.width;

  const ratio = Math.min(heightRatio, widthRatio);

  const height = ratio * video.height;
  const width = ratio * video.width;

  useEffect(() => {
    let hls: Hls;
    if (videoRef.current) {
      const { current } = videoRef;
      if (current.canPlayType("application/vnd.apple.mpegurl")) {
        // Some browers (safari and ie edge) support HLS natively
        current.src = vidUrl;
      } else if (Hls.isSupported()) {
        // This will run in all other modern browsers
        hls = new Hls();
        hls.loadSource(vidUrl);
        hls.attachMedia(current);
      } else {
        console.error("This is a legacy browser that doesn't support MSE");
      }
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [vidUrl, videoRef]);

  const onLoadedMetadata = useCallback(() => {
    setLoaded(true);
  }, []);

  const containerCss: React.CSSProperties = useMemo(() => {
    return {
      backgroundColor: "white",
      marginBottom: 0,
      display: "flex",
      flexDirection: mobileLayout ? "column" : "row",
      height: mobileLayout ? "100%" : undefined,
      width: mobileLayout ? "100%" : undefined,
      position: mobileLayout ? "absolute" : undefined,
      left: mobileLayout ? 0 : undefined,
      top: mobileLayout ? 0 : undefined,
    };
  }, [mobileLayout]);

  const loadingStyle = useMemo(() => {
    return {
      ...loadingContainer,
      height,
      width,
    };
  }, [height, width]);

  return (
    <div ref={container} style={containerCss}>
      {loaded ? null : (
        <div style={loadingStyle}>
          <Spinner style={spinner} />
        </div>
      )}
      <video
        ref={videoRef}
        style={videoCss}
        onLoadedMetadata={onLoadedMetadata}
        loop
        height={height}
        width={width}
        autoPlay
      />
      <div style={sidebar}>
        <VideoSidebar video={video} />
      </div>
    </div>
  );
};
