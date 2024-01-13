import React, { createRef, useCallback, useRef, useState } from "react";
import { AbsoluteFill, spring } from "remotion";
import { CurrentCountry } from "./CurrentCountry";
import styles from "./player-styles.module.css";

export const paddingAndMargin = 20;
const height = 360;
const width = 640;
export const cardHeight = (height - paddingAndMargin * 3) / 2;
export const cardWidth = (width - paddingAndMargin * 3) / 2;

type Position = {
  x: number;
  y: number;
};

const getPositionForIndex = (index: number): Position => {
  const x =
    index % 2 === 0 ? paddingAndMargin : cardWidth + paddingAndMargin * 2;
  const y = index < 2 ? paddingAndMargin : cardHeight + paddingAndMargin * 2;

  return { x, y };
};

const getInitialPositions = () => {
  return new Array(4).fill(true).map((_, i) => getPositionForIndex(i));
};

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

const arePositionsEqual = (a: Position[], b: Position[]) => {
  return a.every((pos, i) => {
    return pos.x === b[i].x && pos.y === b[i].y;
  });
};

const Card: React.FC<{
  index: number;
  refsToUse: React.MutableRefObject<HTMLDivElement>[];
  onUpdate: (newIndices: number[]) => void;
  content: React.ReactNode;
  positions: React.MutableRefObject<Position[]>;
  shouldBePositions: React.MutableRefObject<Position[]>;
  indices: number[];
}> = ({
  positions,
  shouldBePositions,
  index,
  refsToUse,
  onUpdate,
  content,
  indices,
}) => {
  const refToUse = refsToUse[index];
  const stopPrevious = useRef<(() => void)[]>([]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  let newIndices = [...indices];

  const applyPositions = useCallback(
    (except: number | null) => {
      let stopped = false;
      stopPrevious.current.forEach((s) => {
        s();
      });
      stopPrevious.current.push(() => {
        stopped = true;
      });
      positions.current.forEach((_, i) => {
        const shouldBe = shouldBePositions.current[i];
        const ref = refsToUse[i].current;
        if (!ref) {
          return;
        }

        if (except === null) {
          ref.style.pointerEvents = "none";
        }

        if (i === except) {
          ref.style.left = getPositionForIndex(i).x + "px";
          ref.style.top = getPositionForIndex(i).y + "px";
          return;
        }

        let animationI = 1;
        const duration = 20;

        const releasePositionX = positions.current[i].x;
        const releasePositionY = positions.current[i].y;

        const finishAnimation = () => {
          refsToUse.forEach((r) => {
            r.current.style.zIndex = "1";
            r.current.classList.remove(styles.active);
            r.current.classList.remove(styles.passive);
          });
          if (i === 0) {
            setTimeout(() => {
              onUpdate([...newIndices]);
            }, 200);
          }
        };

        if (
          releasePositionX === shouldBe.x &&
          releasePositionY === shouldBe.y &&
          animationI === duration &&
          except === null
        ) {
          finishAnimation();
          return;
        }

        const update = () => {
          if (stopped) {
            return;
          }

          const progress = spring({
            fps: 60,
            frame: animationI,
            config: {
              damping: 200,
            },
            durationInFrames: duration,
            durationRestThreshold: 0.001,
          });
          const newX =
            progress * (shouldBe.x - releasePositionX) + releasePositionX;
          const newY =
            progress * (shouldBe.y - releasePositionY) + releasePositionY;
          ref.style.left = `${newX}px`;
          ref.style.top = `${newY}px`;
          positions.current[i] = {
            x: newX,
            y: newY,
          };
          animationI++;
          if (animationI === duration && except === null) {
            finishAnimation();

            return;
          }

          requestAnimationFrame(update);
        };

        update();
      });
    },
    [newIndices, onUpdate, positions, refsToUse, shouldBePositions],
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
      refToUse.current.classList.add(styles.active);

      const onMove = (evt: PointerEvent) => {
        refsToUse.forEach((r) => {
          if (r !== refToUse) {
            r.current.classList.add(styles.passive);
          }
        });
        const scale =
          refToUse.current.getBoundingClientRect().width / cardWidth;

        translateX = (evt.clientX - startX) * (1 / scale);
        translateY = (evt.clientY - startY) * (1 / scale);

        const position = getIndexFromPosition(
          cardLeft + translateX,
          cardTop + translateY,
        );

        if (position === index) {
          if (
            !arePositionsEqual(getInitialPositions(), shouldBePositions.current)
          ) {
            shouldBePositions.current = getInitialPositions();
            applyPositions(index);
          }
        } else {
          const newPos = getInitialPositions();
          newPos[position] = getPositionForIndex(index);
          newPos[index] = getPositionForIndex(position);
          // eslint-disable-next-line react-hooks/exhaustive-deps
          newIndices = [...indices];
          const prevIndexPosition = newIndices[position];
          newIndices[position] = newIndices[index];
          newIndices[index] = prevIndexPosition;

          if (!arePositionsEqual(newPos, shouldBePositions.current)) {
            shouldBePositions.current = newPos;
            applyPositions(index);
          }
        }

        refToUse.current.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`;
        refToUse.current.style.zIndex = "2";
      };

      refToUse.current.addEventListener(
        "pointerup",
        () => {
          positions.current[index] = {
            x: cardLeft + translateX,
            y: cardTop + translateY,
          };
          console.log(
            "release",
            positions.current[index].x,
            positions.current[index].y,
          );
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
    [applyPositions, index, positions, refToUse, shouldBePositions],
  );

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
  }, []);

  const { x, y } = getPositionForIndex(index);

  return (
    <div
      ref={refToUse}
      className={styles.card}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      style={{
        width: cardWidth,
        height: cardHeight,
        position: "absolute",
        left: x,
        top: y,
        userSelect: "none",
        border: "1px solid #EAEAEA",
        borderRadius: 13,
        overflow: "hidden",
      }}
    >
      <AbsoluteFill
        style={{
          backgroundColor: "#EAEAEA",
        }}
        className={styles.content}
      >
        <CurrentCountry />
        {content}
      </AbsoluteFill>
    </div>
  );
};

export const Cards: React.FC<{
  onUpdate: (newIndices: number[]) => void;
  indices: number[];
}> = ({ onUpdate, indices }) => {
  const [refs] = useState(() => {
    return new Array(4).fill(true).map(() => {
      return createRef<HTMLDivElement>();
    });
  });

  const positions = useRef(getInitialPositions());
  const shouldBePositions = useRef(getInitialPositions());

  return (
    <AbsoluteFill>
      {new Array(4).fill(true).map((_, i) => {
        return (
          <Card
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            onUpdate={onUpdate}
            refsToUse={refs}
            index={i}
            content={indices[i]}
            positions={positions}
            shouldBePositions={shouldBePositions}
            indices={indices}
          />
        );
      })}
    </AbsoluteFill>
  );
};
