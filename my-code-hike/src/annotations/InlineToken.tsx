import { AnnotationHandler, InnerToken } from "codehike/code";

export const tokenTransitions: AnnotationHandler = {
  name: "token-transitions",
  Token: ({ ...props }) => (
    <InnerToken merge={props} style={{ display: "inline-block" }} />
  ),
};
