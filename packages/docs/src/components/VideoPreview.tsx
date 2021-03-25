import useBaseUrl from "@docusaurus/useBaseUrl";
import clsx from "clsx";
import React from "react";
import styled from "styled-components";

const A = styled.a`
  color: inherit;
  cursor: pointer;
  &:hover {
    color: inherit;
  }
`;

const videoStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  padding: "2rem 0",
  width: "100%",
};

const videoTitle: React.CSSProperties = {
  marginTop: "1rem",
};

export const VideoPreview: React.FC<{
  videoUrl: string;
  imageUrl: string;
  title: string;
  description: React.ReactNode;
  onClick: () => void;
}> = ({ videoUrl, imageUrl, title, description, onClick }) => {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <A className={clsx("col col--4", videoStyle)} onClick={onClick}>
      <div className="text--center">
        <img width={300} height={200} src={imgUrl}></img>
      </div>
      <h3 style={videoTitle}>{title}</h3>
      <p>{description}</p>
    </A>
  );
};
