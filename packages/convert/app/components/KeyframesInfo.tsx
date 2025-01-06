import type {MediaParserKeyframe} from '@remotion/media-parser';
import React from 'react';
import {TableCell, TableRow} from './ui/table';

const KeyframesChart: React.FC<{
	readonly keyframes: MediaParserKeyframe[];
	readonly durationInSeconds: number;
}> = ({keyframes, durationInSeconds}) => {
	const averageEverySeconds = durationInSeconds / keyframes.length;

	return (
		<div>
			<div className="rounded-lg border-2 border-black h-10 p-[2px] px-2">
				<div className="relative w-full h-full rounded ">
					{keyframes.map((k) => {
						const left =
							(k.presentationTimeInSeconds / durationInSeconds) * 100;
						return (
							<div
								key={k.presentationTimeInSeconds}
								className="absolute h-full bg-black"
								style={{
									left: `${left}%`,
									width: keyframes.length > 50 ? '1px' : '2px',
								}}
							/>
						);
					})}
				</div>
			</div>
			<div className="flex flex-row mt-1">
				<div className="text-muted-foreground text-xs pl-2">0s</div>
				<div className="flex-1" />
				<div className="text-muted-foreground text-xs pr-2">
					{durationInSeconds.toFixed(0)}s
				</div>
			</div>
			<div className="text-muted-foreground text-xs mt-2">
				On average, a keyframe appears every {averageEverySeconds.toFixed(2)}{' '}
				seconds.
			</div>
		</div>
	);
};

export const KeyframesInfo: React.FC<{
	readonly keyframes: MediaParserKeyframe[];
	readonly trackId: number;
	readonly durationInSeconds: number | null;
}> = ({keyframes, trackId, durationInSeconds}) => {
	const trackKeyframes = React.useMemo(
		() => keyframes.filter((k) => k.trackId === trackId),
		[keyframes, trackId],
	);

	if (trackKeyframes.length === 0) {
		return null;
	}

	if (durationInSeconds === null) {
		return null;
	}

	return (
		<>
			<TableRow
				style={{
					borderBottom: 0,
				}}
			>
				<TableCell className="font-brand">Keyframes</TableCell>
				<TableCell className="text-right">{trackKeyframes.length}</TableCell>
			</TableRow>
			<TableRow>
				<TableCell colSpan={2} className="pt-0">
					<KeyframesChart
						keyframes={trackKeyframes}
						durationInSeconds={durationInSeconds}
					/>
				</TableCell>
			</TableRow>
		</>
	);
};
