import { CreateVideoInternals } from "create-video";
import React from "react";
import { AbsoluteFill, Img } from "remotion";
import "./font.css";

export const TemplateComp: React.FC<{
  templateId: string;
}> = ({ templateId }) => {
  const template = CreateVideoInternals.FEATURED_TEMPLATES.find(
    (t) => t.cliId === templateId
  );
  return (
    <AbsoluteFill
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        backgroundColor: "#fff",
        fontSize: 32,
        fontWeight: 700,
        justifyContent: "center",
        alignItems: "center",
        padding: 60,
        fontFamily: "GTPlanar",
      }}
    >
      <div>
        <div
          style={{
            flexDirection: "row",
            display: "flex",
            paddingLeft: 30,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              flexDirection: "row",
              alignItems: "center",
              padding: "15px 30px",
              translate: "0px 30px",
              backgroundColor: "white",
            }}
          >
            Jumpstart your Remotion Project
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "row",
          }}
        >
          <div
            style={{
              backgroundColor: "#0B84F3",
              display: "flex",
              padding: 50,
              minWidth: 500,
              width: "100%",
            }}
          >
            <div
              style={{
                color: "white",
                fontFamily: "GTPlanar",
                fontSize: 80,
              }}
            >
              {template.shortName} Template
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            height: 120,
            backgroundColor: "#222",
            paddingRight: 40,
          }}
        >
          <div
            style={{
              flex: 1,
              fontFamily: "GTPlanar",
              color: "white",
              height: "100%",
              display: "flex",
              alignItems: "center",
              paddingLeft: 40,
              fontWeight: 300,
              fontSize: 20,
              marginRight: 200,
            }}
          >
            npx create-video --template {template.cliId}
          </div>
          <div
            style={{
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Img
              style={{
                height: 60,
              }}
              src="https://www.remotion.dev/img/remotion-white.png"
            />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
