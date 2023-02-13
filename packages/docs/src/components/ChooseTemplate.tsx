import Link from "@docusaurus/Link";
import { CreateVideoInternals } from "create-video";
import React from "react";

import { MoreTemplatesButton } from "./ArrowRight";
import { IconForTemplate } from "./IconForTemplate";
import { TemplateIcon } from "./TemplateIcon";

export const ChooseTemplate: React.FC = () => {
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
          textAlign: "center",
        }}
      >
        <div
          className="no-scroll-bar"
          style={{
            backgroundColor: "var(--background)",
            display: "inline-flex",
            flexDirection: "row",
            justifyContent: "center",
            boxShadow: "0 0 4px 0px var(--ifm-color-emphasis-200)",
            borderRadius: 50,
            alignItems: "center",
            padding: 12,
            paddingLeft: 24,
            paddingRight: 24,
          }}
        >
          {CreateVideoInternals.FEATURED_TEMPLATES.slice(0, 4).map(
            (template) => {
              return (
                <Link key={template.cliId} to={`/templates/${template.cliId}`}>
                  <TemplateIcon label={template.homePageLabel}>
                    <IconForTemplate scale={0.7} template={template} />
                  </TemplateIcon>
                </Link>
              );
            }
          )}
          <MoreTemplatesButton />
        </div>
      </div>
    </div>
  );
};
