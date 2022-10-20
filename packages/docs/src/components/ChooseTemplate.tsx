import type { Template } from "create-video";
import { CreateVideoInternals } from "create-video";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { chunk } from "../helpers/chunk";
import { useMobileLayout } from "../helpers/mobile-layout";
import { NavigateLeft, NavigateRight } from "./ArrowRight";
import { Blank } from "./icons/blank";
import { Cubes } from "./icons/cubes";
import { JSIcon } from "./icons/js";
import { RemixIcon } from "./icons/remix";
import { SkiaIcon } from "./icons/skia";
import { StillIcon } from "./icons/still";
import { Tailwind } from "./icons/tailwind";
import { TypeScriptIcon } from "./icons/ts";
import { TTSIcon } from "./icons/tts";
import { Waveform } from "./icons/waveform";
import { TemplateIcon } from "./TemplateIcon";
import { TemplateModal } from "./TemplateModal";

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

  if (template.homePageLabel === "Remix") {
    return (
      <RemixIcon
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

  const mobileLayout = useMobileLayout();

  const onClick = useCallback((template: Template) => {
    setModal(template);
  }, []);

  const onDismiss = useCallback(() => {
    setModal(null);
  }, []);

  const [rightVisible, setRightVisible] = useState(true);
  const [leftVisible, setLeftVisible] = useState(false);

  const chunks = chunk(CreateVideoInternals.FEATURED_TEMPLATES, 4);

  const scrollable = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  const onClickRight = useCallback(() => {
    scrollable.current.scrollTo({
      left: 1000,
    });
  }, []);

  const onClickLeft = useCallback(() => {
    scrollable.current.scrollTo({
      left: 0,
    });
  }, []);

  useEffect(() => {
    const listener = (e: Event) => {
      const scrollLeft = (e.target as HTMLDivElement).scrollLeft as number;
      const { width } = (e.target as HTMLDivElement).getClientRects()[0];
      const { width: innerWidth } = inner.current.getClientRects()[0];
      const fromRight = width - innerWidth - scrollLeft;
      setRightVisible(fromRight > 40);
      setLeftVisible(scrollLeft > 20);
    };

    const { current } = scrollable;

    current.addEventListener("scroll", listener);

    return () => {
      current.removeEventListener("scroll", listener);
    };
  }, []);

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
      <div
        style={{
          position: "relative",
        }}
      >
        <div
          ref={scrollable}
          className="no-scroll-bar"
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: mobileLayout ? "flex-start" : "center",
            maxWidth: "100%",
            overflowX: "auto",
            scrollBehavior: "smooth",
          }}
        >
          {chunks.map((c) => {
            return (
              <div
                ref={inner}
                key={c.map((_) => _.cliId).join("-")}
                style={{
                  display: "flex",
                  flexDirection: "row",
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
        {mobileLayout ? (
          <NavigateLeft visible={leftVisible} onClick={onClickLeft} />
        ) : null}
        {mobileLayout ? (
          <NavigateRight visible={rightVisible} onClick={onClickRight} />
        ) : null}
      </div>
    </div>
  );
};
