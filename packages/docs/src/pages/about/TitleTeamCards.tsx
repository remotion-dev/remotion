import React from "react";
import { TeamCardsLayout } from "./TeamCards";

const center: React.CSSProperties = {
  textAlign: "center",
};

export const TitleTeamCards: React.FC = () => {
  return (
    <div>
      <h1 style={center}>
        Remotion{" "}
        <span
          style={{
            color: "var(--ifm-color-primary)",
          }}
        >
          Team
        </span>
      </h1>
      <TeamCardsLayout />
    </div>
  );
};
