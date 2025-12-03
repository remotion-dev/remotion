import { z } from "zod";
import { Button } from "@/components/ui/button";
import { InputContainer } from "./Container";
import { DownloadButton } from "./DownloadButton";
import { ErrorComp } from "./Error";
import { Input } from "./Input";
import { ProgressBar } from "./ProgressBar";
import { COMP_NAME, CompositionProps } from "../../types/constants";
import { useRendering } from "../helpers/use-rendering";

export const RenderControls: React.FC<{
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
  inputProps: z.infer<typeof CompositionProps>;
}> = ({ text, setText, inputProps }) => {
  const { renderMedia, state, undo } = useRendering(COMP_NAME, inputProps);

  return (
    <InputContainer>
      {state.status === "init" ||
      state.status === "invoking" ||
      state.status === "error" ? (
        <div className="flex flex-col gap-geist-quarter">
          <Input
            disabled={state.status === "invoking"}
            setText={setText}
            text={text}
          />
          <div className="self-end">
            <Button
              disabled={state.status === "invoking"}
              loading={state.status === "invoking"}
              onClick={renderMedia}
            >
              Render video
            </Button>
          </div>
          {state.status === "error" ? (
            <ErrorComp message={state.error.message} />
          ) : null}
        </div>
      ) : null}
      {state.status === "rendering" || state.status === "done" ? (
        <div className="flex flex-col gap-geist-quarter">
          <ProgressBar
            progress={state.status === "rendering" ? state.progress : 1}
          />
          <div className="self-end">
            <DownloadButton undo={undo} state={state} />
          </div>
        </div>
      ) : null}
    </InputContainer>
  );
};
