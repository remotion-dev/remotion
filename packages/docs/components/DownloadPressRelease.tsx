import React from "react";

const style: React.CSSProperties = {
  textDecoration: "none",
  fontWeight: "bold",
  flexDirection: "row",
  display: "inline-flex",
  alignItems: "center",
  marginBottom: 15,
};

const icon: React.CSSProperties = {
  height: 20,
  marginRight: 10,
  marginTop: -3,
};

export const DownloadPressRelease: React.FC = () => {
  return (
    <>
      <div>
        <a
          style={style}
          href="/documents/RemotionSeedFundingPressRelease.pdf"
          download="remotion-press-release.pdf"
        >
          <svg
            style={icon}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
          >
            <path
              fill="currentcolor"
              d="M512 416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96C0 60.7 28.7 32 64 32H181.5c17 0 33.3 6.7 45.3 18.7l26.5 26.5c12 12 28.3 18.7 45.3 18.7H448c35.3 0 64 28.7 64 64V416zM280 200c0-13.3-10.7-24-24-24s-24 10.7-24 24V302.1l-31-31c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l72 72c9.4 9.4 24.6 9.4 33.9 0l72-72c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-31 31V200z"
            />
          </svg>{" "}
          <div>Download Press Release</div>
        </a>
      </div>
      <div>
        <a
          style={style}
          href="/documents/RemotionSeedFundingPressKit.zip"
          download="remotion-press-kit.zip"
        >
          <svg
            style={icon}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
          >
            <path
              fill="currentcolor"
              d="M512 416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96C0 60.7 28.7 32 64 32H181.5c17 0 33.3 6.7 45.3 18.7l26.5 26.5c12 12 28.3 18.7 45.3 18.7H448c35.3 0 64 28.7 64 64V416zM280 200c0-13.3-10.7-24-24-24s-24 10.7-24 24V302.1l-31-31c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l72 72c9.4 9.4 24.6 9.4 33.9 0l72-72c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-31 31V200z"
            />
          </svg>{" "}
          <div>Download Press Kit</div>
        </a>
      </div>
    </>
  );
};
