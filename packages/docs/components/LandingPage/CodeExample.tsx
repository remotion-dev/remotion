import { Player } from "@remotion/player";
import React, { useState } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import styled from "styled-components";

const IMG_WIDTH = 1120;
const IMG_HEIGHT = 760;
const ASPECT = IMG_WIDTH / IMG_HEIGHT;

const Demo: React.FC = () => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 10, 40, 49], [0, 1, 1, 0]);
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
      }}
    >
      <img
        style={{ transform: `scale(${scale})` }}
        src="http://localhost:3000/img/logo-small.png"
      />
    </div>
  );
};

const container = {
  width: 500,
  height: (1 / ASPECT) * 500,
  position: "relative" as const,
};

const Preview: React.FC = () => {
  return (
    <Player
      component={Demo}
      compositionHeight={IMG_HEIGHT}
      compositionWidth={IMG_WIDTH}
      durationInFrames={50}
      style={container}
      controls
      fps={30}
    ></Player>
  );
};

const Tab = styled.button<{
  active: boolean;
}>`
  appearance: none;
  background-color: transparent;
  font-family: inherit;
  border: none;
  cursor: pointer;
  color: var(--text-color);
  opacity: ${(props) => (props.active ? 1 : 0.5)};
`;

type Tab = "code" | "preview";

export const CodeExample: React.FC = () => {
  const [tab, setTab] = useState<Tab>("code");
  return (
    <div style={{ flex: 1, textAlign: "left", width: 500 }}>
      <Tab active={tab === "code"} onClick={() => setTab("code")}>
        Code
      </Tab>
      |
      <Tab active={tab === "preview"} onClick={() => setTab("preview")}>
        Preview
      </Tab>
      <div>
        {tab === "code" && (
          <div style={container}>
            <img src="/img/code-sample.png"></img>
          </div>
        )}
        {tab === "preview" && <Preview></Preview>}
      </div>
    </div>
  );
};
