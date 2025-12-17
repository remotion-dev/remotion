"use client";

import { Button } from "@/components/ui/button";
import { DownloadButton } from "./DownloadButton";
import { ErrorComp } from "./Error";
import { ProgressBar } from "./ProgressBar";
import { useRendering } from "../helpers/use-rendering";

export const RenderControls: React.FC<{
  code: string;
}> = ({ code }) => {
  const { renderMedia, state, undo } = useRendering({ code });

  return (
    <div className="flex flex-col gap-2">
      {state.status === "init" ||
      state.status === "invoking" ||
      state.status === "error" ? (
        <>
          <Button
            disabled={state.status === "invoking" || !code}
            loading={state.status === "invoking"}
            onClick={renderMedia}
          >
            Render video
          </Button>
          {state.status === "error" ? (
            <ErrorComp message={state.error.message} />
          ) : null}
        </>
      ) : null}
      {state.status === "rendering" || state.status === "done" ? (
        <div className="flex flex-col gap-2">
          <ProgressBar
            progress={state.status === "rendering" ? state.progress : 1}
          />
          <DownloadButton undo={undo} state={state} />
        </div>
      ) : null}
    </div>
  );
};
