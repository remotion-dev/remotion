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
import { LogViewer } from "./LogViewer";

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
							<div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>
								{state.phase}
								{state.progress > 0
									? ` (${Math.round(state.progress * 100)}%)`
									: null}
							</div>
							<ProgressBar progress={state.progress} />
							{state.phase !== "Preparing machine..." &&
								state.phase !== "Creating sandbox..." && (
									<LogViewer logs={state.logs} />
								)}
						</>
					) : null}
					{state.status === "error" ? (
						<>
							<LogViewer logs={state.logs} />
							<ErrorComp message={state.error.message}></ErrorComp>
						</>
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
