import { z } from "zod";
import { AlignEnd } from "./AlignEnd";
import { Button } from "./Button";
import { InputContainer } from "./Container";
import { ErrorComp } from "./Error";
import { Input } from "./Input";
import { ProgressBar } from "./ProgressBar";
import { Spacing } from "./Spacing";
import { COMP_NAME, CompositionProps } from "../../types/constants";
import { RenderItem, useRendering } from "../helpers/use-rendering";
import { LogViewer } from "./LogViewer";

const RenderItemDisplay: React.FC<{
	render: RenderItem;
	onRemove: () => void;
}> = ({ render, onRemove }) => {
	const { state } = render;

	if (state.status === "error") {
		return (
			<div className="mt-4">
				<LogViewer logs={state.logs} />
				<ErrorComp message={state.error.message} />
				<Spacing />
				<AlignEnd>
					<Button secondary onClick={onRemove}>
						Dismiss
					</Button>
				</AlignEnd>
			</div>
		);
	}

	const progress =
		state.status === "invoking" ? Math.round(state.progress * 100) : 100;
	const isDone = state.status === "done";
	const isPreparing = state.status === "invoking" && state.progress === 0;

	return (
		<div className="mt-4">
			<div className="flex items-center gap-3">
				<div className="flex-1">
					<ProgressBar
						progress={state.status === "invoking" ? state.progress : 1}
					/>
				</div>
				<Button
					square
					secondary
					disabled={!isDone}
					onClick={isDone ? onRemove : undefined}
				>
					{isDone ? (
						<CloseIcon />
					) : (
						<span className="font-mono">{progress}%</span>
					)}
				</Button>
				<Button
					disabled={!isDone}
					onClick={isDone ? () => window.open(state.url) : undefined}
					className="grid content-center justify-items-center"
					style={{ gridTemplateAreas: '"stack"' }}
				>
					<span
						className={`transition-opacity duration-200 ${isDone ? "visible opacity-100" : "invisible opacity-0"}`}
						style={{ gridArea: "stack" }}
					>
						Download
					</span>
					<span
						className={`transition-opacity duration-200 ${!isDone && !isPreparing ? "visible opacity-100" : "invisible opacity-0"}`}
						style={{ gridArea: "stack" }}
					>
						Rendering
					</span>
					<span
						className={`transition-opacity duration-200 ${isPreparing ? "visible opacity-100" : "invisible opacity-0"}`}
						style={{ gridArea: "stack" }}
					>
						Preparing
					</span>
				</Button>
			</div>
			{state.status === "invoking" && <LogViewer logs={state.logs} />}
		</div>
	);
};

const CloseIcon: React.FC = () => {
	return (
		<svg height="1em" viewBox="0 0 384 512">
			<path
				fill="currentColor"
				d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
			/>
		</svg>
	);
};

export const RenderControls: React.FC<{
	text: string;
	setText: React.Dispatch<React.SetStateAction<string>>;
	inputProps: z.infer<typeof CompositionProps>;
}> = ({ text, setText, inputProps }) => {
	const { renderMedia, renders, removeRender } = useRendering(
		COMP_NAME,
		inputProps,
	);

	return (
		<InputContainer>
			<Input setText={setText} text={text} />
			<Spacing />
			<AlignEnd>
				<Button onClick={renderMedia}>Render video</Button>
			</AlignEnd>
			{renders.map((render) => (
				<RenderItemDisplay
					key={render.id}
					render={render}
					onRemove={() => removeRender(render.id)}
				/>
			))}
		</InputContainer>
	);
};
