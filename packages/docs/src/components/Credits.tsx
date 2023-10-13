import React from "react";
import contributorsData from "../data/contributorsData";

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

const ContributorCard = ({ name, username, avatarUrl, contributionType }) => {
  return (
    <div style={cardStyle}>
      <img src={avatarUrl} alt={username} style={avatarStyle} />
      <div style={infoStyle}>
        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          style={linkStyle}
        >
          <strong>{name}</strong>
        </a>
        <p style={labelStyle}>{contributionType}</p>
      </div>
    </div>
  );
};

const Credits = () => {
  return (
    <div style={containerStyle}>
      <h3 style={{ fontSize: "2em", marginBottom: "20px" }}>Credits</h3>
      <div style={cardContainerStyle}>
        {contributorsData.map((contributor) => (
          <ContributorCard key={contributor.id} {...contributor} />
        ))}
      </div>
    </div>
  );
};

export default Credits;
