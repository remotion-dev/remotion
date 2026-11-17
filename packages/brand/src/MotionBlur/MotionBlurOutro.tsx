import {Audio} from '@remotion/media';
import {HtmlInCanvasMotionBlur} from '@remotion/motion-blur';
import type {ReactNode} from 'react';
import {
	Easing,
	interpolate,
	Sequence,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const getBounceGeometry = (width: number, height: number) => {
	const portrait = height > width;
	const panelWidth = portrait ? width : width / 2;
	const panelHeight = portrait ? height / 2 : height;
	const centerX = portrait ? width / 2 : (width * 3) / 4;
	const centerY = portrait ? (height * 3) / 4 : height / 2;
	const tileWidth = panelWidth * 0.35;
	const tileHeight = panelHeight * 0.35;
	const horizontalRange = width - tileWidth;
	const verticalRange = height - tileHeight;
	return {
		centerX,
		centerY,
		tileWidth,
		tileHeight,
		horizontalRange,
		verticalRange,
		horizontalSpeed: horizontalRange * (840 / 960) * 2,
		verticalSpeed: verticalRange * (570 / 540) * 2,
	};
};

const BouncingPresenter = ({children}: {readonly children: ReactNode}) => {
	const frame = useCurrentFrame();
	const {width, height, fps} = useVideoConfig();
	const {
		centerX,
		centerY,
		tileWidth,
		tileHeight,
		horizontalRange,
		verticalRange,
		horizontalSpeed,
		verticalSpeed,
	} = getBounceGeometry(width, height);
	const bounceSeconds = Math.max(0, frame / fps - 5.8);
	const horizontalTravel =
		centerX - tileWidth / 2 - bounceSeconds * horizontalSpeed;
	const verticalTravel =
		centerY - tileHeight / 2 - bounceSeconds * verticalSpeed;
	const x =
		horizontalRange -
		Math.abs(
			Math.abs(horizontalTravel % (2 * horizontalRange)) - horizontalRange,
		);
	const y =
		verticalRange -
		Math.abs(Math.abs(verticalTravel % (2 * verticalRange)) - verticalRange);

	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				transformOrigin: `${centerX}px ${centerY}px`,
				translate: `${x + tileWidth / 2 - centerX}px ${y + tileHeight / 2 - centerY}px`,
				scale: interpolate(frame, [5.43 * fps, 5.8 * fps], [1, 0.35], {
					easing: Easing.bezier(0.22, 1, 0.36, 1),
					output: 'perceptual-scale',
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				}),
			}}
		>
			{children}
		</div>
	);
};

const BounceSounds = () => {
	const {width, height, fps, durationInFrames} = useVideoConfig();
	const geometry = getBounceGeometry(width, height);
	const impactFrames = [
		{
			start: geometry.centerX - geometry.tileWidth / 2,
			range: geometry.horizontalRange,
			speed: geometry.horizontalSpeed,
		},
		{
			start: geometry.centerY - geometry.tileHeight / 2,
			range: geometry.verticalRange,
			speed: geometry.verticalSpeed,
		},
	]
		.flatMap(({start, range, speed}) => {
			const firstImpact = 5.8 + start / speed;
			const interval = range / speed;
			return Array.from(
				{
					length: Math.max(
						0,
						Math.ceil((durationInFrames / fps - firstImpact) / interval),
					),
				},
				(_, index) => Math.round((firstImpact + index * interval) * fps),
			);
		})
		.filter((impactFrame) => impactFrame < durationInFrames)
		.sort((a, b) => a - b)
		.filter((impactFrame, index, frames) => {
			return index === 0 || impactFrame - frames[index - 1] > 1;
		});

	return (
		<Sequence name="Edge bounce sounds" layout="none">
			{impactFrames.map((impactFrame) => (
				<Audio
					key={impactFrame}
					name="Wall contact"
					from={impactFrame}
					src="https://remotion.media/motion-blur-2026-11-17/sound-lab-rebound-c990fa67fe78.wav"
					volume={(audioFrame) =>
						0.22 *
						interpolate(
							impactFrame + audioFrame,
							[durationInFrames - 3, durationInFrames],
							[1, 0],
							{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
						)
					}
				/>
			))}
		</Sequence>
	);
};

export const MotionBlurOutro = ({children}: {readonly children: ReactNode}) => {
	const frame = useCurrentFrame();
	const {width, height, fps} = useVideoConfig();

	return (
		<>
			<HtmlInCanvasMotionBlur
				name="6 - Bouncing presenter motion blur"
				width={width}
				height={height}
				shutterAngle={285}
				samples={12}
				disabled={frame < 5.43 * fps}
				disabledInPreview={false}
			>
				<BouncingPresenter>{children}</BouncingPresenter>
			</HtmlInCanvasMotionBlur>
			<BounceSounds />
		</>
	);
};
