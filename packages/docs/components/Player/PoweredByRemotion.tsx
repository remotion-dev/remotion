import React from "react";

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
          textAlign: "center",
        }}
      >
        <p style={{ marginBottom: 8 }}>
          <strong>Powered by Remotion</strong>
        </p>
        <p style={{ marginBottom: 0 }}>
          Remotion is the premier framework for writing videos in React.
          <br />
          Use our Timeline UI and Fast Refresh to get every frame perfect,
          before you embed it in a website.
        </p>
      </div>
    </div>
  );
};
