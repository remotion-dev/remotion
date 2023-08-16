import { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from "../types.js";

// No options: https://www.totaltypescript.com/the-empty-object-type-in-typescript
type FadeProps = Record<string, never>;

const FadePresentation: React.FC<
  TransitionPresentationComponentProps<FadeProps>
> = ({ children, presentationDirection, presentationProgress }) => {
  const style: React.CSSProperties = useMemo(() => {
    return {
      opacity: presentationDirection === "in" ? presentationProgress : 1,
    };
  }, [presentationDirection, presentationProgress]);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={style}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

export const fade = (props?: FadeProps): TransitionPresentation<FadeProps> => {
  return {
    component: FadePresentation,
    props: props ?? {},
  };
};
