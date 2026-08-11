import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Freeze,
	interpolate,
	Sequence,
	useCurrentFrame,
} from 'remotion';
import type {CodingPromptProps} from './CodingPrompt';
import {CodingPrompt, codingPromptSchema} from './CodingPrompt';
import {Map} from './Map';

export const homepageAssetMasterSchema = codingPromptSchema;
export const homepageAssetMasterDurationInFrames = 240;
const masterFlightCurveStartFrame = 86;
const resetStartFrame = 196;
const resetDurationInFrames = 24;

const MapLayer: React.FC = () => {
	return (
		<Sequence
			durationInFrames={247}
			style={{
				translate: '-60.5px -168.7px',
				scale: 0.742,
			}}
		>
			<Map lineStartFrame={masterFlightCurveStartFrame} />
		</Sequence>
	);
};

const CodingPromptLayer: React.FC<CodingPromptProps> = ({
	promptLine1,
	promptLine2,
}) => {
	return (
		<Sequence
			durationInFrames={247}
			style={{
				translate: '88.5px 170.7px',
				scale: 0.665,
			}}
		>
			<CodingPrompt promptLine1={promptLine1} promptLine2={promptLine2} />
		</Sequence>
	);
};

const Scene: React.FC<CodingPromptProps> = ({promptLine1, promptLine2}) => {
	return (
		<>
			<MapLayer />
			<CodingPromptLayer
				promptLine1={promptLine1}
				promptLine2={promptLine2}
			/>
		</>
	);
};

export const HomepageAssetMaster: React.FC<CodingPromptProps> = ({
	promptLine1,
	promptLine2,
}) => {
	const frame = useCurrentFrame();
	const resetProgress = Easing.bezier(0.645, 0.045, 0.355, 1)(
		interpolate(
			frame,
			[resetStartFrame, resetStartFrame + resetDurationInFrames],
			[0, 1],
			{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
		),
	);

	return (
		<>
			<AbsoluteFill>
				<Scene promptLine1={promptLine1} promptLine2={promptLine2} />
			</AbsoluteFill>
			<Sequence
				from={resetStartFrame}
				durationInFrames={homepageAssetMasterDurationInFrames - resetStartFrame}
				style={{
					opacity: resetProgress,
				}}
			>
				<Freeze frame={0}>
					<Scene promptLine1={promptLine1} promptLine2={promptLine2} />
				</Freeze>
			</Sequence>
		</>
	);
};
