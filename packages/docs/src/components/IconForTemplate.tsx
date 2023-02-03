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
  if (template.homePageLabel === "TypeScript") {
    return (
      <TypeScriptIcon
        style={{
          height: scale * 48,
        }}
      />
    );
  }

  if (template.homePageLabel === "Blank") {
    return (
      <Blank
        style={{
          height: scale * 36,
        }}
      />
    );
  }

  if (template.homePageLabel === "JavaScript") {
    return (
      <JSIcon
        style={{
          height: scale * 40,
        }}
      />
    );
  }

  if (template.homePageLabel === "3D") {
    return (
      <Cubes
        style={{
          height: scale * 36,
        }}
      />
    );
  }

  if (template.homePageLabel === "Stills") {
    return (
      <StillIcon
        style={{
          height: scale * 36,
        }}
      />
    );
  }

  if (template.homePageLabel === "Audiogram") {
    return (
      <Waveform
        style={{
          height: scale * 36,
        }}
      />
    );
  }

  if (template.homePageLabel === "Text-To-Speech") {
    return (
      <TTSIcon
        style={{
          height: scale * 36,
        }}
      />
    );
  }

  if (template.homePageLabel === "Tailwind") {
    return (
      <Tailwind
        style={{
          height: scale * 36,
        }}
      />
    );
  }

  if (template.homePageLabel === "Skia") {
    return (
      <SkiaIcon
        style={{
          height: scale * 32,
        }}
      />
    );
  }

  if (template.homePageLabel === "Remix") {
    return (
      <RemixIcon
        style={{
          height: scale * 32,
        }}
      />
    );
  }

  if (template.homePageLabel === "Overlay") {
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
