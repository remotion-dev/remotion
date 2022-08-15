import Hls from "hls.js";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

const getVideoToPlayUrl = (muxId: string) => {
  return `https://stream.mux.com/${muxId}.m3u8`;
};

const MuxVideoForward: React.ForwardRefRenderFunction<
  HTMLVideoElement,
  React.DetailedHTMLProps<
    React.VideoHTMLAttributes<HTMLVideoElement>,
    HTMLVideoElement
  > & {
    muxId: string;
  }
> = ({ muxId, ...props }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const vidUrl = getVideoToPlayUrl(muxId);

  useImperativeHandle(ref, () => videoRef.current);

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

  return <video ref={videoRef} {...props} />;
};

export const MuxVideo = forwardRef(MuxVideoForward);
