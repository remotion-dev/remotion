import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import P5 from "p5";
import { Internals, useCurrentFrame } from "remotion";

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
  getSketch: () => P5 | null;
};

const P5ForwardRefFunction: React.ForwardRefRenderFunction<
  P5Canvas,
  {
    renderer?: P5.RENDERER;
    width: number;
    height: number;
  } & React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > &
    Partial<
      Record<typeof p5Events[number], (p5: P5, ...rest: unknown[]) => void>
    >
> = (props, ref) => {
  const canvasParentRef = React.useRef<HTMLDivElement>(null);

  const {
    draw,
    windowResized,
    preload,
    mouseClicked,
    doubleClicked,
    mouseMoved,
    mousePressed,
    mouseWheel,
    mouseDragged,
    mouseReleased,
    keyPressed,
    keyReleased,
    keyTyped,
    touchStarted,
    touchMoved,
    touchEnded,
    deviceMoved,
    deviceTurned,
    deviceShaken,
    width,
    height,
    ...restProps
  } = props;

  const frame = useCurrentFrame();

  const [p5, setP5] = useState<P5 | null>(null);

  useEffect(() => {
    const instance = new P5((p5: P5) => {
      p5.setup = () => {
        p5.createCanvas(width, height, props.renderer).parent(
          canvasParentRef.current as HTMLDivElement
        );
      };

      p5.noLoop();

      p5Events.forEach((event) => {
        const ev = props[event];

        if (ev) {
          p5[event] = (...rest) => {
            ev(p5, ...rest);
          };
        }
      });
    });
    setP5(instance);
    return () => {
      instance.remove();
    };
  }, []);

  useEffect(() => {
    if (!p5) return;
    if (!draw) return;
    p5.draw = (...rest) => {
      draw(p5, ...rest);
    };
  }, [draw]);

  useEffect(() => {
    p5?.redraw?.();
  }, [frame]);

  useImperativeHandle(ref, () => {
    return {
      getSketch: () => p5,
    };
  });

  return <div ref={canvasParentRef} {...restProps} />;
};

export const ProcessingCanvas = forwardRef(P5ForwardRefFunction);
