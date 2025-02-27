import { VERSION } from "remotion";
import { z } from "zod";

export const COMPOSITION_FPS = 30;
export const DURATION_IN_FRAMES = 7 * COMPOSITION_FPS;
export const COMPOSITION_WIDTH = 1920;
export const COMPOSITION_HEIGHT = 1080;
export const COMPOSITION_ID = "LogoAnimation";
export const RAM = 2048;
export const DISK = 10240;
export const TIMEOUT = 240;
export const SITE_NAME = "remotion-react-router-example-" + VERSION;

export const CompositionProps = z.object({
  title: z.string(),
});

export const defaultMyCompProps: z.infer<typeof CompositionProps> = {
  title: "React Router and Remotion",
};
