import React, { useCallback, useState } from "react";
import type { Template } from "create-video";
import { CreateVideoInternals } from "create-video";
import { TemplateModal } from "./TemplateModal";
import { Blank } from "./icons/blank";
import { Cubes } from "./icons/cubes";
import { JSIcon } from "./icons/js";
import { StillIcon } from "./icons/still";
import { TypeScriptIcon } from "./icons/ts";
import { TTSIcon } from "./icons/tts";
import { Waveform } from "./icons/waveform";
import { TemplateIcon } from "./TemplateIcon";
import { chunk } from "../helpers/chunk";
import { useElementSize } from "../helpers/use-el-size";
import { SkiaIcon } from "./icons/skia";
import { Tailwind } from "./icons/tailwind";

const IconForTemplate: React.FC<{
  template: Template;
}> = ({ template }) => {
  if (template.homePageLabel === "TypeScript") {
    return (
      <TypeScriptIcon
        style={{
          height: 48,
        }}
      />
    );
  }

  if (template.homePageLabel === "Blank") {
    return (
      <Blank
        style={{
          height: 36,
        }}
      />
    );
  }

  if (template.homePageLabel === "JavaScript") {
    return (
      <JSIcon
        style={{
          height: 40,
        }}
      />
    );
  }

  if (template.homePageLabel === "3D") {
    return (
      <Cubes
        style={{
          height: 36,
        }}
      />
    );
  }

  if (template.homePageLabel === "Stills") {
    return (
      <StillIcon
        style={{
          height: 36,
        }}
      />
    );
  }

  if (template.homePageLabel === "Audiogram") {
    return (
      <Waveform
        style={{
          height: 36,
        }}
      />
    );
  }

  if (template.homePageLabel === "TTS") {
    return (
      <TTSIcon
        style={{
          height: 36,
        }}
      />
    );
  }

  if (template.homePageLabel === "Tailwind") {
    return (
      <Tailwind
        style={{
          height: 36,
        }}
      />
    );
  }

  if (template.homePageLabel === "Skia") {
    return (
      <SkiaIcon
        style={{
          height: 32,
        }}
      />
    );
  }

  return (
    <Blank
      style={{
        height: 40,
      }}
    />
  );
};

export const ChooseTemplate: React.FC = () => {
  const [modal, setModal] = useState<Template | null>(null);

  const containerSize = useElementSize(
    typeof document === "undefined" ? null : document.body
  );
  const mobileLayout = (containerSize?.width ?? Infinity) < 900;

  const onClick = useCallback((template: Template) => {
    setModal(template);
  }, []);

  const onDismiss = useCallback(() => {
    setModal(null);
  }, []);

  const chunks = chunk(CreateVideoInternals.FEATURED_TEMPLATES, 4);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      {modal ? (
        <TemplateModal selectedTemplate={modal} onDismiss={onDismiss} />
      ) : null}
      <div style={{ flex: 1 }} />
      <div
        style={{
          display: "flex",
          flexDirection: mobileLayout ? "column" : "row",
          justifyContent: "center",
        }}
      >
        {chunks.map((c) => {
          return (
            <div
              key={c.map((_) => _.cliId).join("-")}
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                marginBottom: mobileLayout ? 8 : 0,
                marginTop: mobileLayout ? 8 : 0,
              }}
            >
              {c.map((template) => {
                return (
                  <TemplateIcon
                    key={template.cliId}
                    onClick={() => onClick(template)}
                    label={template.homePageLabel}
                  >
                    <IconForTemplate template={template} />
                  </TemplateIcon>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
