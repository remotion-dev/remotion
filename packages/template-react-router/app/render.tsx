import { ActionFunction } from "react-router";
import { renderVideo } from "./lib/render-video.server";
import { SITE_NAME, COMPOSITION_ID } from "./remotion/constants.mjs";
import { errorAsJson } from "./lib/return-error-as-json";
import { RenderRequest } from "./remotion/schemata";

export const action: ActionFunction = errorAsJson(async ({ request }) => {
  const formData = await request.json();
  const { inputProps } = RenderRequest.parse(formData);

  const renderData = await renderVideo({
    serveUrl: SITE_NAME,
    composition: COMPOSITION_ID,
    inputProps,
    outName: `logo-animation.mp4`,
    metadata: null,
  });

  return renderData;
});
