import Link from "@docusaurus/Link";
import { CreateVideoInternals } from "create-video";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { chunk } from "../helpers/chunk";
import { NavigateLeft, NavigateRight } from "./ArrowRight";
import { IconForTemplate } from "./IconForTemplate";
import { TemplateIcon } from "./TemplateIcon";

export const ChooseTemplate: React.FC = () => {
  const mobileLayout = true;

  const [rightVisible, setRightVisible] = useState(true);
  const [leftVisible, setLeftVisible] = useState(false);

  const chunks = chunk(CreateVideoInternals.FEATURED_TEMPLATES, 4);

  const scrollable = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  const onClickRight = useCallback(() => {
    scrollable.current.scrollTo({
      left: 1900,
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
                    <Link
                      key={template.cliId}
                      to={`/templates/${template.cliId}`}
                    >
                      <TemplateIcon label={template.homePageLabel}>
                        <IconForTemplate scale={1} template={template} />
                      </TemplateIcon>
                    </Link>
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
