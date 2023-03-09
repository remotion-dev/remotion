import React, { useEffect, useMemo, useRef, useState } from "react";
import type { RiveCanvas } from "@rive-app/canvas-advanced";
import type {
  Artboard,
  CanvasRenderer,
  LinearAnimationInstance,
} from "@rive-app/canvas-advanced";
import riveCanvas from "@rive-app/canvas-advanced";
import { useVideoConfig, useCurrentFrame } from "remotion";

interface RiveProps {
  src: string;
}
export const RemotionRiveCanvas: React.FC<RiveProps> = ({ src }) => {
  const { width, fps, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const canvas = useRef<HTMLCanvasElement>(null);
  const [riveCanvasInstance, setRiveCanvas] = useState<RiveCanvas | null>(null);
  const [err, setError] = useState<Error | null>(null);

  if (err) {
    throw err;
  }

  const [rive, setRive] = useState<{
    animation: LinearAnimationInstance;
    renderer: CanvasRenderer;
    artboard: Artboard;
  } | null>(null);

  useEffect(() => {
    riveCanvas({
      locateFile: () =>
        "https://unpkg.com/@rive-app/canvas-advanced@1.0.98/rive.wasm",
    })
      .then((riveInstance) => {
        setRiveCanvas(riveInstance);
      })
      .catch((newErr) => {
        setError(newErr);
      });
  }, []);

  useEffect(() => {
    if (!riveCanvasInstance) {
      return;
    }

    const renderer = riveCanvasInstance.makeRenderer(
      canvas.current as HTMLCanvasElement
    );
    fetch(new Request(src))
      .then((f) => f.arrayBuffer())
      .then((b) => {
        riveCanvasInstance.load(new Uint8Array(b)).then((file) => {
          const artboard = file.defaultArtboard();
          const animation = new riveCanvasInstance.LinearAnimationInstance(
            artboard.animationByIndex(0),
            artboard
          );
          setRive({
            animation,
            artboard,
            renderer,
          });
        });
      })
      .catch((newErr) => {
        setError(newErr);
      });
  }, [riveCanvasInstance, src]);

  React.useEffect(() => {
    if (!rive || !canvas.current || !riveCanvasInstance) {
      return;
    }

    riveCanvasInstance.requestAnimationFrame(() => {
      if (rive && canvas.current) {
        rive.renderer.clear();

        if (rive.animation) {
          rive.animation.advance(1 / fps);
          rive.animation.apply(1);
        }

        rive.artboard.advance(1 / fps);

        rive.renderer.save();
        rive.renderer.align(
          riveCanvasInstance.Fit.contain,
          riveCanvasInstance.Alignment.center,
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
  }, [frame, fps, rive, riveCanvasInstance]);

  const style: React.CSSProperties = useMemo(
    () => ({
      height,
      width,
    }),
    [height, width]
  );

  return <canvas ref={canvas} width={width} height={height} style={style} />;
};
