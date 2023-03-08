import React, { useEffect, useMemo, useRef, useState } from "react";
import type {
  Artboard,
  CanvasRenderer,
  LinearAnimationInstance,
  RiveCanvas,
} from "@rive-app/canvas-advanced";
import riveCanvas from "@rive-app/canvas-advanced";
import { useVideoConfig, useCurrentFrame } from "remotion";

interface RiveProps {
  src: string;
}
export const Rive: React.FC<RiveProps> = ({ src }) => {
  const { width, fps, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const canvas = useRef<HTMLCanvasElement>(null);

  const [rive, setRive] = useState<{
    animation: LinearAnimationInstance;
    renderer: CanvasRenderer;
    artboard: Artboard;
    riveInstance: RiveCanvas;
  } | null>(null);

  useEffect(() => {
    riveCanvas({
      locateFile: () =>
        "https://unpkg.com/@rive-app/canvas-advanced@1.0.98/rive.wasm",
    }).then((riveInstance) => {
      const renderer = riveInstance.makeRenderer(
        canvas.current as HTMLCanvasElement
      );
      fetch(new Request(src))
        .then((f) => f.arrayBuffer())
        .then((b) => {
          riveInstance.load(new Uint8Array(b)).then((file) => {
            const artboard = file.defaultArtboard();
            const animation = new riveInstance.LinearAnimationInstance(
              artboard.animationByIndex(0),
              artboard
            );
            setRive({
              animation,
              artboard,
              renderer,
              riveInstance,
            });
          });
        });
    });
  }, [src]);

  React.useEffect(() => {
    rive?.riveInstance.requestAnimationFrame(() => {
      if (rive && canvas.current) {
        rive.renderer.clear();

        if (rive.animation) {
          rive.animation.advance(1 / fps);
          rive.animation.apply(1);
        }

        rive.artboard.advance(1 / fps);

        rive.renderer.save();
        rive.renderer.align(
          rive.riveInstance.Fit.contain,
          rive.riveInstance.Alignment.center,
          {
            minX: 0,
            minY: 0,
            maxX: canvas.current.width,
            maxY: canvas.current.height,
          },
          rive.artboard.bounds
        );

        rive.artboard.draw(rive.renderer);
        rive.renderer.restore();
      }
    });
  }, [frame, fps, rive]);

  const style: React.CSSProperties = useMemo(
    () => ({
      height,
      width,
    }),
    [height, width]
  );

  return <canvas ref={canvas} width={width} height={height} style={style} />;
};
