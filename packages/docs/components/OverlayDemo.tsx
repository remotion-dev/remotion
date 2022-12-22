import React, { useCallback, useRef } from "react";
import "./transparent-video.css";

export const OverlayDemo: React.FC = () => {
  const ref = useRef<HTMLVideoElement>(null);
  const onClick = useCallback(() => {
    ref.current?.classList.toggle("transparent");
  }, []);
  return (
    <div>
      <div
        style={{
          alignItems: "flex-start",
          flexDirection: "row",
          display: "flex",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "70%",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              border: "1px solid var(--ifm-color-emphasis-300)",
              borderRadius: "var(--ifm-pre-border-radius)",
            }}
          >
            <video ref={ref} src="/img/overlay.webm" controls autoPlay loop />
          </div>
          <div style={{ marginTop: "8px" }} />
          <p className="tr-centered" onClick={onClick}>
            <button type="button">Toggle transparency</button>
          </p>
        </div>

        <p style={{ marginLeft: "10px" }}>
          {" "}
          Want the source code? Check out the template
        </p>
      </div>
    </div>
  );
};
