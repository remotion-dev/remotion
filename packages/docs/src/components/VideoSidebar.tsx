import React from "react";
import styled from "styled-components";
import { ShowcaseLink, ShowcaseVideo } from "../data/showcase-videos";

const Container = styled.div`
  padding: 20px;
`;

const Title = styled.div`
  font-weight: bold;
  margin-bottom: 12px;
`;

const Description = styled.div`
  font-size: 14px;
  margin-bottom: 20px;
`;

const A = styled.a`
  font-size: 14px;
  font-weight: bold;
`;

const getLinkLabel = (linkType: ShowcaseLink) => {
  switch (linkType) {
    case "source_code":
      return "Source code";
    case "tutorial":
      return "Tutorial";
    case "website":
      return "Website";
    case "video":
      return "Video";
  }
};

export const VideoSidebar: React.FC<{
  video: ShowcaseVideo;
}> = ({ video }) => {
  return (
    <Container>
      <Title>{video.title}</Title>
      <Description>{video.description}</Description>
      {video.links.map((link) => {
        return (
          <div key={link.url}>
            <A href={link.url}>{getLinkLabel(link.type)}</A>
          </div>
        );
      })}
    </Container>
  );
};
