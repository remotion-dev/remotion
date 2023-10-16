import { useColorMode } from "@docusaurus/theme-common";
import React from "react";

const containerStyle: React.CSSProperties = {
  margin: "20px 0",
};

const cardContainerStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "flex-start",
};

const avatarStyle: React.CSSProperties = {
  width: "100px",
  height: "100px",
  borderRadius: "50%",
  marginRight: "20px",
  flexShrink: 0,
  border: "2px solid #D6D6D6",
};

const linkStyle: React.CSSProperties = {
  textDecoration: "none",
  fontSize: "1.2em",
  color: "#000000",
};

interface Contributor {
  name: string;
  username: string;
  contributionType: string;
}

interface CreditsProps {
  contributors: Contributor[];
}

export const Credits: React.FC<CreditsProps> = ({ contributors }) => {
  const { colorMode } = useColorMode();

  const textColor = colorMode === "dark" ? "#ffffff" : "#000000";
  const backgroundColor = colorMode === "dark" ? "#333333" : "#ffffff";

  const cardStyle: React.CSSProperties = {
    maxWidth: "300px",
    width: "100%",
    borderRadius: "10px",
    overflow: "hidden",
    margin: "10px",
    padding: "10px",
    display: "flex",
    color: textColor,
    backgroundColor,
  };

  return (
    <div style={containerStyle}>
      <div style={cardContainerStyle}>
        {contributors.map((contributor) => (
          <div key={contributor.username} style={cardStyle}>
            <img
              src={`https://github.com/${contributor.username}.png`}
              alt={contributor.username}
              style={avatarStyle}
            />
            <div
              style={{
                color: textColor,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <a
                href={`https://github.com/${contributor.username}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...linkStyle, color: textColor }}
              >
                <strong>{contributor.name}</strong>
              </a>
              <p
                style={{
                  color: textColor,
                  fontSize: "0.9em",
                  marginTop: "5px",
                }}
              >
                {contributor.contributionType}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
