import React, { useCallback } from "react";

export const paddingAndMargin = 20;
const height = 360;
const width = 640;
export const cardHeight = (height - paddingAndMargin * 3) / 2;
export const cardWidth = (width - paddingAndMargin * 3) / 2;

const getPositionForIndex = (index: number) => {
  const x =
    index % 2 === 0 ? paddingAndMargin : cardWidth + paddingAndMargin * 2;
  const y = index < 2 ? paddingAndMargin : cardHeight + paddingAndMargin * 2;

  return { x, y };
};

export const Card: React.FC<{
  index: number;
  refToUse: React.MutableRefObject<HTMLDivElement>;
}> = ({ index, refToUse }) => {
  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      const startX = e.clientX;
      const startY = e.clientY;

      const onMove = (evt: PointerEvent) => {
        refToUse.current.style.transform = `translateX(${
          evt.clientX - startX
        }px) translateY(${evt.clientY - startY}px)`;
        refToUse.current.style.zIndex = "2";

        refToUse.current.addEventListener(
          "pointerup",
          () => {
            refToUse.current.style.transform = `translateX(0px) translateY(0px)`;
            refToUse.current.removeEventListener("pointermove", onMove);
          },
          { once: true },
        );
      };

      refToUse.current.addEventListener("pointermove", onMove);
    },
    [refToUse],
  );

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
  }, []);

  const { x, y } = getPositionForIndex(index);

  return (
    <div
      ref={refToUse}
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
