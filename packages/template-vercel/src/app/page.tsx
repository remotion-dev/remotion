"use client";

import { Player } from "@remotion/player";
import type { NextPage } from "next";
import { useCallback, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import {
  defaultMyCompProps,
  CompositionProps,
  DURATION_IN_FRAMES,
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
} from "../../types/constants";
import { RenderControls } from "../components/RenderControls";
import { Tips } from "../components/Tips";
import { Main } from "../remotion/MyComp/Main";

interface Render {
  url: string;
  downloadUrl: string;
  pathname: string;
  size: number;
  uploadedAt: string;
}

const Home: NextPage = () => {
  const [text, setText] = useState<string>(defaultMyCompProps.title);
  const [renders, setRenders] = useState<Render[]>([]);
  const fetchRenders = useCallback(async () => {
    try {
      const res = await fetch("/api/renders");
      const json = await res.json();
      if (json.type === "success") {
        setRenders(json.data);
      }
    } catch {
      // Silently fail — renders list is non-critical
    }
  }, []);

  useEffect(() => {
    fetchRenders();
  }, [fetchRenders]);

  const inputProps: z.infer<typeof CompositionProps> = useMemo(() => {
    return {
      title: text,
    };
  }, [text]);

  return (
    <div>
      <div className="max-w-screen-md m-auto mb-5 px-4 mt-16 flex flex-col gap-10">
        <div className="overflow-hidden rounded-geist shadow-[0_0_200px_rgba(0,0,0,0.15)]">
          <Player
            component={Main}
            inputProps={inputProps}
            durationInFrames={DURATION_IN_FRAMES}
            fps={VIDEO_FPS}
            compositionHeight={VIDEO_HEIGHT}
            compositionWidth={VIDEO_WIDTH}
            style={{
              width: "100%",
            }}
            controls
            autoPlay
            loop
          />
        </div>
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-foreground">New Render</h2>
          <RenderControls
            text={text}
            setText={setText}
            inputProps={inputProps}
          ></RenderControls>
        </section>
        {renders.length > 0 && (
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-foreground">
              Previous Renders
            </h2>
            <div className="flex flex-col gap-2">
              {renders.map((render) => (
                <button
                  key={render.pathname}
                  type="button"
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = render.downloadUrl;
                    a.download = "";
                    a.click();
                  }}
                  className="flex items-center justify-between rounded-geist border border-unfocused-border-color bg-background p-geist-half transition-colors hover:border-foreground text-left cursor-pointer"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-foreground">
                      {render.pathname}
                    </span>
                    <span className="text-xs text-subtitle">
                      {new Date(render.uploadedAt).toLocaleString()} &middot;{" "}
                      {(render.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <span className="text-sm text-foreground">
                    Download &rarr;
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}
        <Tips></Tips>
      </div>
    </div>
  );
};

export default Home;
