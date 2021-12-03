import React, { forwardRef, useEffect, useState } from "react";
import P5 from "p5";

export const p5Events = [
  "draw",
  "windowResized",
  "preload",
  "mouseClicked",
  "doubleClicked",
  "mouseMoved",
  "mousePressed",
  "mouseWheel",
  "mouseDragged",
  "mouseReleased",
  "keyPressed",
  "keyReleased",
  "keyTyped",
  "touchStarted",
  "touchMoved",
  "touchEnded",
  "deviceMoved",
  "deviceTurned",
  "deviceShaken",
] as const;

export type P5Canvas = {
  getSketch: () => P5;
};

const P5ForwardRefFunction: React.ForwardRefRenderFunction<
  P5Canvas,
  React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > &
    Partial<
      Record<typeof p5Events[number], (p5: P5, ...rest: unknown[]) => void>
    >
> = (props, ref) => {
  const canvasParentRef = React.useRef<HTMLDivElement>(null);

  const [p5] = useState(() => {
    const instance = new P5((p5: P5) => {
      p5.setup = () => {
        p5.createCanvas(200, 200).parent(
          canvasParentRef.current as HTMLDivElement
        );
      };

      p5Events.forEach((event) => {
        const ev = props[event];
        if (ev) {
          p5[event] = (...rest) => {
            ev(p5, ...rest);
          };
        }
      });
    });
    return instance;
  });

  useEffect(() => {
    return () => {
      p5.remove();
    };
  }, []);

  return <div ref={canvasParentRef} {...props} />;
};

export const ProcessingCanvas = forwardRef(P5ForwardRefFunction);
