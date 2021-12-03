import { useCallback, useEffect, useRef } from "react";
import { P5Canvas, ProcessingCanvas } from "./react-p5";

export const P5Demo = () => {
  const ref = useRef<P5Canvas>(null);

  useEffect(() => {
    const p5 = ref.current?.getSketch();
    if (!p5) {
      return;
    }

    p5.background(0);
    p5.fill(255, 0 * 1.3, 0);
    p5.ellipse(p5.width / 2, 0, 50);
  }, []);

  return <ProcessingCanvas ref={ref}></ProcessingCanvas>;
};
