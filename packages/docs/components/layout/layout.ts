import { css } from "styled-components";

export const BREAKPOINT_WIDTH = 900;

export const mobile = (arg0: any, ...args: any[]) => css`
  @media (max-width: ${BREAKPOINT_WIDTH}px) {
    ${css(arg0, ...args)};
  }
`;
