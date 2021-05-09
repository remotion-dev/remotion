import React from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex: 1;
  cursor: pointer;
  position: relative;
`;

export const PlayerPreview: React.FC = () => {
  return (
    <a href="https://www.youtube.com/watch?v=gwlDorikqgY" target="_blank">
      <Container>
        <img
          style={{
            boxShadow: "0 0 8px rgba(0, 0, 0, 0.2)",
          }}
          src="http://i3.ytimg.com/vi/gwlDorikqgY/maxresdefault.jpg"
        ></img>
        <div
          style={{
            width: "100%",
            textAlign: "center",
            position: "absolute",
            bottom: 20,
            color: "black",
            fontSize: 13,
          }}
        >
          Watch 2 min video
        </div>
      </Container>
    </a>
  );
};
