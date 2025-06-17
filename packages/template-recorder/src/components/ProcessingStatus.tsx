import React from "react";

export type ProcessStatus = {
  title: string;
  description: string;
  abort: null | (() => void);
};

const statusStyle: React.CSSProperties = {
  fontSize: 13,
  color: "rgba(255, 255, 255, 0.8)",
  display: "block",
};

const subtitle: React.CSSProperties = {
  color: "rgba(255, 255, 255, 0.5)",
  fontSize: 13,
};

export const ProcessingStatus: React.FC<{
  readonly status: ProcessStatus;
}> = ({ status }) => {
  return (
    <div style={statusStyle}>
      <div>{status.title}</div>
      <div style={subtitle}>
        {status.description}{" "}
        {status.abort !== null ? (
          <a
            className="underline cursor-pointer"
            onClick={() => status.abort?.()}
          >
            Abort and discard
          </a>
        ) : null}{" "}
      </div>
    </div>
  );
};
