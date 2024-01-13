import React, { useCallback } from "react";
import { spring } from "remotion";

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

const getInitialPositions = () => {
  return new Array(4).fill(true).map((_, i) => getPositionForIndex(i));
};

const positions = getInitialPositions();
let shouldBePositions = getInitialPositions();

const getIndexFromPosition = (clientX: number, clientY: number) => {
  const left = clientX < cardWidth / 2 + paddingAndMargin;
  const top = clientY < cardHeight / 2 + paddingAndMargin;

  if (left && top) {
    return 0;
  }

  if (!left && top) {
    return 1;
  }

  if (left && !top) {
    return 2;
  }

  if (!left && !top) {
    return 3;
  }
};

const arePositionsEqual = (a: typeof positions, b: typeof positions) => {
  return a.every((pos, i) => {
    return pos.x === b[i].x && pos.y === b[i].y;
  });
};

export const Card: React.FC<{
  index: number;
  refsToUse: React.MutableRefObject<HTMLDivElement>[];
}> = ({ index, refsToUse }) => {
  const refToUse = refsToUse[index];

  const applyPositions = useCallback(
    (except: number | null) => {
      positions.forEach((_, i) => {
        const shouldBe = shouldBePositions[i];
        const ref = refsToUse[i].current;
        if (!ref) {
          return;
        }

        if (i === except) {
          ref.style.left = getPositionForIndex(i).x + "px";
          ref.style.top = getPositionForIndex(i).y + "px";
          return;
        }

        ref.style.zIndex = "1";
        let animationI = 0;
        const duration = 60;

        const releasePositionX = positions[i].x;
        const releasePositionY = positions[i].y;

        const update = () => {
          const progress = spring({
            fps: 30,
            frame: animationI,
            config: {
              damping: 200,
            },
          });
          const newX =
            progress * (shouldBe.x - releasePositionX) + releasePositionX;
          const newY =
            progress * (shouldBe.y - releasePositionY) + releasePositionY;
          ref.style.left = `${newX}px`;
          ref.style.top = `${newY}px`;
          positions[i] = {
            x: newX,
            y: newY,
          };
          animationI++;
          if (animationI === duration) {
            return;
          }

          requestAnimationFrame(update);
        };

        update();
      });
    },
    [refsToUse],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      const cardLeft = refToUse.current.offsetLeft;
      const cardTop = refToUse.current.offsetTop;
      const startX = e.clientX;
      const startY = e.clientY;

      let translateX = 0;
      let translateY = 0;
      const onMove = (evt: PointerEvent) => {
        const scale =
          refToUse.current.getBoundingClientRect().width / cardWidth;

        translateX = (evt.clientX - startX) * (1 / scale);
        translateY = (evt.clientY - startY) * (1 / scale);

        const position = getIndexFromPosition(
          cardLeft + translateX,
          cardTop + translateY,
        );

        if (position === index) {
          if (!arePositionsEqual(getInitialPositions(), shouldBePositions)) {
            shouldBePositions = getInitialPositions();
            applyPositions(index);
          }
        } else {
          const newPos = getInitialPositions();
          newPos[position] = getPositionForIndex(index);
          newPos[index] = getPositionForIndex(position);
          if (!arePositionsEqual(newPos, shouldBePositions)) {
            shouldBePositions = newPos;
            applyPositions(index);
          }
        }

        refToUse.current.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`;
        refToUse.current.style.zIndex = "2";
      };

      refToUse.current.addEventListener(
        "pointerup",
        () => {
          positions[index] = {
            x: cardLeft + translateX,
            y: cardTop + translateY,
          };
          refToUse.current.style.left = `${cardLeft + translateX}px`;
          refToUse.current.style.top = `${cardTop + translateY}px`;
          refToUse.current.style.transform = `translateX(0px) translateY(0px)`;
          refToUse.current.removeEventListener("pointermove", onMove);
          applyPositions(null);
        },
        { once: true },
      );

      refToUse.current.addEventListener("pointermove", onMove);
    },
    [applyPositions, index, refToUse],
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
