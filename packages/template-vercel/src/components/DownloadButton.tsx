import React from "react";
import { RenderState } from "../helpers/use-rendering";
import { Button } from "./Button";
import { Spacing } from "./Spacing";

const Megabytes: React.FC<{
	sizeInBytes: number;
}> = ({ sizeInBytes }) => {
	const megabytes = Intl.NumberFormat("en", {
		notation: "compact",
		style: "unit",
		unit: "byte",
		unitDisplay: "narrow",
	}).format(sizeInBytes);
	return <span className="opacity-60">{megabytes}</span>;
};

export const DownloadButton: React.FC<{
	state: RenderState & { status: "done" };
	onRemove: () => void;
}> = ({ state, onRemove }) => {
	return (
		<div className="flex">
			<Button secondary onClick={onRemove}>
				<CloseIcon />
			</Button>
			<Spacing />
			<a href={state.url}>
				<Button>
					Download video
					<Spacing />
					<Megabytes sizeInBytes={state.size} />
				</Button>
			</a>
		</div>
	);
};

const CloseIcon: React.FC = () => {
	return (
		<svg height="1em" viewBox="0 0 384 512">
			<path
				fill="var(--foreground)"
				d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
			/>
		</svg>
	);
};
