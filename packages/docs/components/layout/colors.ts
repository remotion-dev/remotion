import { darken, transparentize } from "polished";

export const LIGHT_BLUE = "#42e9f5";
export const DARK_BLUE = "#4290f5";
export const UNDERLAY_BLUE = transparentize(0.85, DARK_BLUE);
export const RED = "#e74c3c";
export const UNDERLAY_RED = transparentize(0.9, RED);
export const BLUE_TEXT = darken(0.3, DARK_BLUE);
