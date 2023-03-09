import React, { useEffect, useMemo, useRef, useState } from "react";
import type { RiveCanvas } from "@rive-app/canvas-advanced";
import type {
  Artboard,
  CanvasRenderer,
  LinearAnimationInstance,
} from "@rive-app/canvas-advanced";
import riveCanvas from "@rive-app/canvas-advanced";
import { useVideoConfig, useCurrentFrame } from "remotion";
import type {
  RemotionRiveCanvasAlignment,
  RemotionRiveCanvasFit,
} from "./map-enums.js";
import { mapToAlignment } from "./map-enums.js";
import { mapToFit } from "./map-enums.js";

interface RiveProps {
  src: string;
  fit?: RemotionRiveCanvasFit;
  alignment?: RemotionRiveCanvasAlignment;
}

export const RemotionRiveCanvas: React.FC<RiveProps> = ({
  src,
  fit = "contain",
  alignment = "center",
}) => {
  const { width, fps, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const canvas = useRef<HTMLCanvasElement>(null);
  const [riveCanvasInstance, setRiveCanvas] = useState<RiveCanvas | null>(null);
  const [err, setError] = useState<Error | null>(null);
  const lastFrame = useRef<number>(0);

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
    if (!riveCanvasInstance) {
      return;
    }

    riveCanvasInstance.requestAnimationFrame(() => {
      if (!rive || !canvas.current) {
        return;
      }

      const diff = frame - lastFrame.current;

      rive.renderer.clear();

      if (rive.animation) {
        rive.animation.advance(diff / fps);
        rive.animation.apply(1);
      }

      rive.artboard.advance(diff / fps);

      rive.renderer.save();
      rive.renderer.align(
        mapToFit(fit),
        mapToAlignment(alignment, riveCanvasInstance.Alignment),
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

      lastFrame.current = frame;
    });
  }, [frame, fps, rive, riveCanvasInstance, fit, alignment]);

  const style: React.CSSProperties = useMemo(
    () => ({
      height,
      width,
    }),
    [height, width]
  );

  return <canvas ref={canvas} width={width} height={height} style={style} />;
};
