import type { ActionFunction, LinksFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { Player } from "@remotion/player";
import React, { useCallback, useMemo, useState } from "react";
import { RenderProgress } from "../components/render-progress";
import { renderVideo } from "../lib/render-video.server";
import type { LogoAnimationProps } from "../remotion/constants";
import {
  SITE_NAME,
  COMPOSITION_DURATION_IN_FRAMES,
  COMPOSITION_FPS,
  COMPOSITION_HEIGHT,
  COMPOSITION_ID,
  COMPOSITION_WIDTH,
} from "../remotion/constants";
import { LogoAnimation } from "../remotion/logo-animation";
import stylesHref from "../styles/layout.css";
import type { RenderResponse } from "../lib/types";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesHref }];
};

const container: React.CSSProperties = {
  fontFamily: "sans-serif",
  lineHeight: "1.4",
  margin: "auto",
  maxWidth: 1200,
};

const content: React.CSSProperties = {
  width: 400,
  padding: 24,
};

const playerContainer: React.CSSProperties = {
  flex: 1,
  aspectRatio: "16 / 9",
};

const playerStyle: React.CSSProperties = {
  width: "100%",
  height: "auto",
  aspectRatio: 16 / 9,
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const personalizedName = formData.get("personalizedName") as string;

  if (!personalizedName) {
    throw new Response(JSON.stringify({ error: "No name entered" }), {
      status: 400,
    });
  }

  const inputProps: LogoAnimationProps = {
    personalizedName,
  };

  const renderData = await renderVideo({
    serveUrl: SITE_NAME,
    composition: COMPOSITION_ID,
    inputProps,
    outName: `logo-animation.mp4`,
  });

  return json(renderData);
};

export default function Index() {
  const [personalizedName, setPersonalizedName] = useState("you");
  const fetcher = useFetcher<RenderResponse>();

  const onNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setPersonalizedName(e.target.value),
    [],
  );

  const onClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault();
      const data = new FormData();
      data.append("personalizedName", personalizedName);
      fetcher.submit(data, { method: "post" });
    },
    [fetcher, personalizedName],
  );

  const inputProps: LogoAnimationProps = useMemo(() => {
    return { personalizedName };
  }, [personalizedName]);

  return (
    <div style={container} className="container">
      <div style={playerContainer}>
        <Player
          component={LogoAnimation}
          inputProps={inputProps}
          durationInFrames={COMPOSITION_DURATION_IN_FRAMES}
          fps={COMPOSITION_FPS}
          compositionWidth={COMPOSITION_WIDTH}
          compositionHeight={COMPOSITION_HEIGHT}
          controls
          style={playerStyle}
        />
      </div>
      <div style={content}>
        <h1>Welcome to the Remotion Remix template!</h1>
        <div>
          {fetcher.data ? (
            <RenderProgress
              bucketName={fetcher.data.bucketName}
              renderId={fetcher.data.renderId}
            />
          ) : fetcher.state === "submitting" ? (
            <div>Invoking</div>
          ) : (
            <div>
              <p>Enter your name for a custom video:</p>
              <fetcher.Form method="post">
                <input
                  type="text"
                  onChange={onNameChange}
                  value={personalizedName}
                />
                <br></br>
                <button type="submit" onClick={onClick}>
                  Render a video
                </button>
              </fetcher.Form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
