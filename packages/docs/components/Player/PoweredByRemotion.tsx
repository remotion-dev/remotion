import React from "react";

const btn: React.CSSProperties = {
  backgroundColor: "white",
  padding: "10px 16px",
  appearance: "none",
  color: "#0B84F3",
  border: "none",
  fontFamily: "inherit",
  fontWeight: "bold",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 16,
};

export const PoweredByRemotion: React.FC = () => {
  return (
    <div style={{ background: `#0B84F3` }}>
      <div
        style={{
          maxWidth: 1000,
          paddingLeft: 16,
          paddingRight: 16,
          margin: "auto",
          paddingTop: 30,
          paddingBottom: 30,
          color: `#fff`,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <div>
          <p style={{ marginBottom: 8 }}>
            <strong>Powered by Remotion</strong>
          </p>
          <p style={{ marginBottom: 0 }}>
            Remotion is the premier framework for writing videos in React.
            <br />
            Use the timeline editor with Fast Refresh to get every frame
            perfect, before you embed it in a website.
          </p>
        </div>
        <div style={{ flex: 1 }} />
        <div>
          <a href="/">
            <button style={btn} type="button">
              Learn more
            </button>
          </a>
        </div>
      </div>
    </div>
  );
};
