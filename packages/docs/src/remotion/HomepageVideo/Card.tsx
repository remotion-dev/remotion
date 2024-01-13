import React from "react";

export const paddingAndMargin = 20;
const height = 360;
const width = 640;
export const cardHeight = (height - paddingAndMargin * 3) / 2;
export const cardWidth = (width - paddingAndMargin * 3) / 2;

export const Card: React.FC<{
  index: number;
}> = ({ index }) => {
  const x =
    index % 2 === 0 ? paddingAndMargin : cardWidth + paddingAndMargin * 2;
  const y = index < 2 ? paddingAndMargin : cardHeight + paddingAndMargin * 2;

  return (
    <div
      style={{
        backgroundColor: "green",
        borderRadius: 13,
        width: cardWidth,
        height: cardHeight,
        position: "absolute",
        left: x,
        top: y,
      }}
    >
      hi there
    </div>
  );
};
