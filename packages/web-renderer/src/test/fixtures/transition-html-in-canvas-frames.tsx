import {
	linearTiming,
	makeHtmlInCanvasPresentation,
	TransitionSeries,
} from '@remotion/transitions';
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

export const sceneAColor = (frame: number) => (frame * 37 + 17) % 255;
export const sceneBColor = (frame: number) => (frame * 53 + 29) % 255;

// During the transition, the halves show the two scenes side by side.
const halves = makeHtmlInCanvasPresentation<Record<string, unknown>>(
	(canvas) => {
		const ctx = canvas.getContext('2d')!;
		return {
			clear: () => ctx.clearRect(0, 0, canvas.width, canvas.height),
			cleanup: () => undefined,
			draw: ({prevImage, nextImage, width, height}) => {
				// Cover the whole output so no stale pixels show through.
				const left = prevImage ?? nextImage;
				const right = nextImage ?? prevImage;
				ctx.clearRect(0, 0, width, height);
				if (left) {
					ctx.drawImage(left, 0, 0, width / 2, height, 0, 0, width / 2, height);
				}

				if (right) {
					ctx.drawImage(
						right,
						width / 2,
						0,
						width / 2,
						height,
						width / 2,
						0,
						width / 2,
						height,
					);
				}
			},
		};
	},
);

const SceneA: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill
			style={{backgroundColor: `rgb(${sceneAColor(frame)}, 0, 0)`}}
		/>
	);
};

const SceneB: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill
			style={{backgroundColor: `rgb(0, ${sceneBColor(frame)}, 0)`}}
		/>
	);
};

const Component: React.FC = () => {
	return (
		<TransitionSeries>
			<TransitionSeries.Sequence durationInFrames={30}>
				<SceneA />
			</TransitionSeries.Sequence>
			<TransitionSeries.Transition
				presentation={halves({})}
				timing={linearTiming({durationInFrames: 10})}
			/>
			<TransitionSeries.Sequence durationInFrames={30}>
				<SceneB />
			</TransitionSeries.Sequence>
		</TransitionSeries>
	);
};

export const transitionHtmlInCanvasFrames = {
	component: Component,
	id: 'transition-html-in-canvas-frames',
	width: 200,
	height: 100,
	fps: 30,
	durationInFrames: 50,
} as const;
