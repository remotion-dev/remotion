import React, { useCallback, useRef } from "react";

export const paddingAndMargin = 20;
const height = 360;
const width = 640;
export const cardHeight = (height - paddingAndMargin * 3) / 2;
export const cardWidth = (width - paddingAndMargin * 3) / 2;

export const Card: React.FC<{
  index: number;
}> = ({ index }) => {
  const ref = useRef<HTMLDivElement>(null);

  const x =
    index % 2 === 0 ? paddingAndMargin : cardWidth + paddingAndMargin * 2;
  const y = index < 2 ? paddingAndMargin : cardHeight + paddingAndMargin * 2;

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const startX = e.clientX;
    const startY = e.clientY;

    const onMove = (evt: PointerEvent) => {
      ref.current.style.transform = `translateX(${
        evt.clientX - startX
      }px) translateY(${evt.clientY - startY}px)`;
      ref.current.style.zIndex = "2";

      ref.current.addEventListener(
        "pointerup",
        () => {
          ref.current.style.transform = `translateX(0px) translateY(0px)`;
          ref.current.removeEventListener("pointermove", onMove);
        },
        { once: true },
      );
    };

    ref.current.addEventListener("pointermove", onMove);
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
  }, []);

  return (
    <div
      ref={ref}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      style={{
        backgroundColor: "#eee",
        borderRadius: 13,
        width: cardWidth,
        height: cardHeight,
        position: "absolute",
        left: x,
        top: y,
      }}
    >
      {index}
    </div>
  );
};
