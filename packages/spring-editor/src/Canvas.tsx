import React, { useEffect, useMemo } from "react";
import { draw, stopDrawing } from "./draw";
import { DraggedConfig } from "./App";
import { AnimationDuration } from "./AnimationDuration";

const canvasRef = React.createRef<HTMLCanvasElement>();

export const Canvas: React.FC<{
  width: number;
  height: number;
  draggedConfig: DraggedConfig | null;
  draggedDuration: number | null;
  duration: number;
  config: DraggedConfig;
  fps: number;
}> = ({
  height,
  width,
  draggedConfig,
  draggedDuration,
  config,
  duration,
  fps,
}) => {
  const canvasStyle: React.CSSProperties = useMemo(() => {
    return {
      width: "100%",
      height: "100%",
      backgroundColor: "var(--background)",
    };
  }, []);

  const [durationType, setDurationType] = React.useState<"seconds" | "frames">(
    "seconds"
  );

  const durationLabel =
    durationType === "seconds"
      ? `${((draggedDuration ?? duration) / fps).toFixed(2)}sec`
      : `${draggedDuration ?? duration} frames`;

  useEffect(() => {
    if (!canvasRef.current) {
      throw new Error("no canvas");
    }

    stopDrawing();
    draw({
      ref: canvasRef.current,
      duration: draggedDuration ?? duration,
      config,
      draggedConfig,
      fps,
      draggedDuration,
      height,
      width,
      labelText: durationLabel,
    });
  }, [
    draggedDuration,
    duration,
    config,
    draggedConfig,
    fps,
    width,
    height,
    durationLabel,
  ]);

  return (
    <>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={canvasStyle}
      />
      <AnimationDuration
        setDurationType={setDurationType}
        durationLabel={durationLabel}
      />
    </>
  );
};
