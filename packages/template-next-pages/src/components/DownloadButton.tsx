import Link from "next/link";
import React from "react";
import { State } from "../helpers/use-rendering";
import { Button } from "./Button/Button";
import { Spacing } from "./Spacing";

const light: React.CSSProperties = {
  opacity: 0.6,
};

const link: React.CSSProperties = {
  textDecoration: "none",
};

const row: React.CSSProperties = {
  display: "flex",
  flexDirection: "row",
};

const Megabytes: React.FC<{
  sizeInBytes: number;
}> = ({ sizeInBytes }) => {
  const megabytes = Intl.NumberFormat("en", {
    notation: "compact",
    style: "unit",
    unit: "byte",
    unitDisplay: "narrow",
  }).format(sizeInBytes);
  return <span style={light}>{megabytes}</span>;
};

export const DownloadButton: React.FC<{
  state: State;
  undo: () => void;
}> = ({ state, undo }) => {
  if (state.status === "rendering") {
    return <Button disabled>Download video</Button>;
  }

  if (state.status !== "done") {
    throw new Error("Download button should not be rendered when not done");
  }

  return (
    <div style={row}>
      <Button secondary onClick={undo}>
        <UndoIcon></UndoIcon>
      </Button>
      <Spacing></Spacing>
      <Link style={link} href={state.url}>
        <Button>
          Download video
          <Spacing></Spacing>
          <Megabytes sizeInBytes={state.size}></Megabytes>
        </Button>
      </Link>
    </div>
  );
};

const UndoIcon: React.FC = () => {
  return (
    <svg height="1em" viewBox="0 0 512 512">
      <path
        fill="var(--foreground)"
        d="M48.5 224H40c-13.3 0-24-10.7-24-24V72c0-9.7 5.8-18.5 14.8-22.2s19.3-1.7 26.2 5.2L98.6 96.6c87.6-86.5 228.7-86.2 315.8 1c87.5 87.5 87.5 229.3 0 316.8s-229.3 87.5-316.8 0c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0c62.5 62.5 163.8 62.5 226.3 0s62.5-163.8 0-226.3c-62.2-62.2-162.7-62.5-225.3-1L185 183c6.9 6.9 8.9 17.2 5.2 26.2s-12.5 14.8-22.2 14.8H48.5z"
      />
    </svg>
  );
};
