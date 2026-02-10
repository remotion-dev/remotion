import { z } from "zod";
import { AlignEnd } from "./AlignEnd";
import { Button } from "./Button";
import { InputContainer } from "./Container";
import { DownloadButton } from "./DownloadButton";
import { ErrorComp } from "./Error";
import { Input } from "./Input";
import { ProgressBar } from "./ProgressBar";
import { Spacing } from "./Spacing";
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
        <>
          <Input
            disabled={state.status === "invoking"}
            setText={setText}
            text={text}
          ></Input>
          <Spacing></Spacing>
          <AlignEnd>
            <Button
              disabled={state.status === "invoking"}
              loading={state.status === "invoking"}
              onClick={renderMedia}
            >
              Render video
            </Button>
          </AlignEnd>
          {state.status === "invoking" ? (
            <>
              <Spacing></Spacing>
              <div
                style={{
                  fontSize: 14,
                  lineHeight: 1.5,
                  minHeight: "2.5em",
                  marginBottom: 8,
                }}
              >
                <div style={{ color: "#666" }}>
                  {state.phase}
                  {state.progress > 0 && state.progress < 1
                    ? ` ${Math.round(state.progress * 100)}%`
                    : null}
                </div>
                <div
                  style={{
                    color: "#999",
                    fontSize: 12,
                    visibility: state.subtitle ? "visible" : "hidden",
                  }}
                >
                  {state.subtitle ?? "\u00A0"}
                </div>
              </div>
              <ProgressBar progress={state.progress} />
            </>
          ) : null}
          {state.status === "error" ? (
            <ErrorComp message={state.error.message}></ErrorComp>
          ) : null}
        </>
      ) : null}
      {state.status === "done" ? (
        <>
          <ProgressBar progress={1} />
          <Spacing></Spacing>
          <AlignEnd>
            <DownloadButton undo={undo} state={state}></DownloadButton>
          </AlignEnd>
        </>
      ) : null}
    </InputContainer>
  );
};
