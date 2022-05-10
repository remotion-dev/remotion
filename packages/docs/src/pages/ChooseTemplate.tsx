import React, { useCallback, useState } from "react";
import { TemplateModal } from "../components/TemplateModal";
import { Blank } from "./icons/blank";
import { Cubes } from "./icons/cubes";
import { JSIcon } from "./icons/js";
import { Next } from "./icons/next";
import { TypeScriptIcon } from "./icons/ts";
import { TTSIcon } from "./icons/tts";
import { Waveform } from "./icons/waveform";
import { TemplateIcon } from "./template-icon";

export const ChooseTemplate: React.FC = () => {
  const [modal, setModal] = useState(false);

  const onClick = useCallback(() => {
    setModal(true);
  }, []);

  const onDismiss = useCallback(() => {
    setModal(false);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      {modal ? <TemplateModal onDismiss={onDismiss}></TemplateModal> : null}
      <div style={{ flex: 1 }} />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        <TemplateIcon onClick={onClick} label={"Blank Project"}>
          <Blank style={{ height: 40 }} />
        </TemplateIcon>
        <TemplateIcon label={"Hello World"}>
          <TypeScriptIcon style={{ height: 40 }} />
        </TemplateIcon>
        <TemplateIcon label={"Plain Javascript"}>
          <JSIcon style={{ width: 40 }} />
        </TemplateIcon>
        <TemplateIcon label={"Audio Visualizer"}>
          <Waveform style={{ width: 40 }} />
        </TemplateIcon>
        <TemplateIcon label={"3D Video"}>
          <Cubes style={{ width: 40 }} />
        </TemplateIcon>
        <TemplateIcon label={"Text to Speech"}>
          <TTSIcon style={{ height: 40 }} />
        </TemplateIcon>
        <TemplateIcon label={"Next.JS project"}>
          <Next style={{ width: 60 }} />
        </TemplateIcon>
      </div>
    </div>
  );
};
