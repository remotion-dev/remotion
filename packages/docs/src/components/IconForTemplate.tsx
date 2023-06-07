import type { Template } from "create-video";
import React from "react";
import { Blank } from "./icons/blank";
import { Cubes } from "./icons/cubes";
import { JSIcon } from "./icons/js";
import { NextIcon } from "./icons/next";
import { OverlayIcon } from "./icons/overlay";
import { RemixIcon } from "./icons/remix";
import { SkiaIcon } from "./icons/skia";
import { StillIcon } from "./icons/still";
import { Tailwind } from "./icons/tailwind";
import { TypeScriptIcon } from "./icons/ts";
import { TTSIcon } from "./icons/tts";
import { Waveform } from "./icons/waveform";

export const IconForTemplate: React.FC<{
  template: Template;
  scale: number;
}> = ({ template, scale = 1 }) => {
  if (template.cliId === "hello-world") {
    return (
      <TypeScriptIcon
        style={{
          height: scale * 48,
        }}
      />
    );
  }

  if (template.cliId === "blank") {
    return (
      <Blank
        style={{
          height: scale * 36,
          overflow: "visible",
        }}
      />
    );
  }

  if (template.cliId === "javascript") {
    return (
      <JSIcon
        style={{
          height: scale * 40,
        }}
      />
    );
  }

  if (template.cliId === "three") {
    return (
      <Cubes
        style={{
          height: scale * 36,
        }}
      />
    );
  }

  if (template.cliId === "still") {
    return (
      <StillIcon
        style={{
          height: scale * 36,
        }}
      />
    );
  }

  if (template.cliId === "audiogram") {
    return (
      <Waveform
        style={{
          height: scale * 36,
        }}
      />
    );
  }

  if (template.cliId === "tts") {
    return (
      <TTSIcon
        style={{
          height: scale * 36,
        }}
      />
    );
  }

  if (template.cliId === "google-tts") {
    return (
      <TTSIcon
        style={{
          height: scale * 36,
        }}
      />
    );
  }

  if (template.cliId === "tailwind") {
    return (
      <Tailwind
        style={{
          height: scale * 36,
        }}
      />
    );
  }

  if (template.cliId === "skia") {
    return (
      <SkiaIcon
        style={{
          height: scale * 32,
        }}
      />
    );
  }

  if (template.cliId === "remix") {
    return (
      <RemixIcon
        style={{
          height: scale * 32,
        }}
      />
    );
  }

  if (template.cliId === "overlay") {
    return <OverlayIcon style={{ height: scale * 42 }} />;
  }

  if (template.cliId === "next") {
    return <NextIcon style={{ height: scale * 36 }} />;
  }

  return (
    <Blank
      style={{
        height: scale * 40,
      }}
    />
  );
};
