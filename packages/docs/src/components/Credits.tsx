import React from "react";

const containerStyle: React.CSSProperties = {
  margin: "20px 0",
};

const cardContainerStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "flex-start",
};

const cardStyle: React.CSSProperties = {
  maxWidth: "300px",
  width: "100%",
  border: "1px solid #e1e4e8",
  borderRadius: "10px",
  overflow: "hidden",
  margin: "10px",
  padding: "20px",
  display: "flex",
};

const avatarStyle: React.CSSProperties = {
  width: "100px",
  height: "100px",
  borderRadius: "50%",
  marginRight: "20px",
  flexShrink: 0,
};

const infoStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
};

const linkStyle: React.CSSProperties = {
  textDecoration: "none",
  fontSize: "1.2em",
  color: "#000000",
};

const labelStyle: React.CSSProperties = {
  fontSize: "1em",
  color: "#586069",
  marginTop: "10px",
};

interface Contributor {
  id: number;
  name: string;
  username: string;
  avatarUrl: string;
  contributionType: string;
}

interface CreditsProps {
  contributors: Contributor[];
}

const Credits: React.FC<CreditsProps> = ({ contributors }) => {
  return (
    <div style={containerStyle}>
      <h3 style={{ fontSize: "2em", marginBottom: "20px" }}>Credits</h3>
      <div style={cardContainerStyle}>
        {contributors.map((contributor) => (
          <div key={contributor.id} style={cardStyle}>
            <img
              src={contributor.avatarUrl}
              alt={contributor.username}
              style={avatarStyle}
            />
            <div style={infoStyle}>
              <a
                href={`https://github.com/${contributor.username}`}
                target="_blank"
                rel="noopener noreferrer"
                style={linkStyle}
              >
                <strong>{contributor.name}</strong>
              </a>
              <p style={labelStyle}>{contributor.contributionType}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Credits;
