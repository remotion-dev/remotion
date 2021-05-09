import React from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex: 1;
  cursor: pointer;
  position: relative;
  &:hover {
    transform: scale(1.015);
  }
  transition: transform 0.3s;
`;

const A = styled.a``;

export const PlayerPreview: React.FC = () => {
  return (
    <A href="https://www.youtube.com/watch?v=gwlDorikqgY" target="_blank">
      <Container>
        <img
          style={{
            boxShadow: "var(--box-shadow)",
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
    </A>
  );
};
