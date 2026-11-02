import {
	Interactive,
	interpolate,
	Sequence,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {TimelineRevealLayers} from './TimelineLayoutReveal';

type TimelineRevealShotProps = {
	readonly revealOffsetInSeconds: number;
	readonly focusX: number;
	readonly focusY: number;
	readonly endFocusX: number;
	readonly endFocusY: number;
	readonly zoom: number;
	readonly endZoom: number;
	readonly rotation: string;
	readonly endRotation: string;
};

const TimelineRevealShotContent = ({
	revealOffsetInSeconds,
	focusX,
	focusY,
	endFocusX,
	endFocusY,
	zoom,
	endZoom,
	rotation,
	endRotation,
}: TimelineRevealShotProps) => {
	const frame = useCurrentFrame();
	const {fps, width, height, durationInFrames} = useVideoConfig();

	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				overflow: 'hidden',
				backgroundColor: '#0b0e14',
				perspective: 4800,
			}}
		>
			<Interactive.Div
				name="Shot camera"
				style={{
					position: 'absolute',
					// Keep the source plane at its native resolution for the macro shots.
					width: 6400,
					height: 4000,
					left: '50%',
					top: '50%',
					translate: interpolate(
						frame,
						[0, durationInFrames - 1],
						[
							`${-focusX * 2.5}px ${-focusY * 2.5}px`,
							`${-endFocusX * 2.5}px ${-endFocusY * 2.5}px`,
						],
						{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
					),
					transformOrigin: interpolate(
						frame,
						[0, durationInFrames - 1],
						[
							`${focusX * 2.5}px ${focusY * 2.5}px`,
							`${endFocusX * 2.5}px ${endFocusY * 2.5}px`,
						],
						{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
					),
					scale: interpolate(
						frame,
						[0, durationInFrames - 1],
						[zoom, endZoom].map(
							(value) => (value / 2.5) * (width < height ? 0.68 : 1),
						),
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							output: 'perceptual-scale',
						},
					),
					rotate: interpolate(
						frame,
						[0, durationInFrames - 1],
						[rotation, endRotation],
						{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
					),
				}}
			>
				<Sequence
					name="Continuous timeline reveal"
					layout="none"
					trimBefore={Math.round(revealOffsetInSeconds * fps)}
					durationInFrames={durationInFrames}
				>
					<TimelineRevealLayers revealDurationInSeconds={12} fadeOut={false} />
				</Sequence>
			</Interactive.Div>
		</div>
	);
};

export const TimelineRevealShot = Interactive.create({
	Component: TimelineRevealShotContent,
	layout: 'absolute-fill',
	schema: {
		revealOffsetInSeconds: {
			type: 'number',
			hiddenFromList: false,
			default: 0,
			description: 'Reveal position in seconds',
			min: 0,
		},
		focusX: {
			type: 'number',
			hiddenFromList: false,
			default: 1280,
			description: 'Start focus X',
		},
		focusY: {
			type: 'number',
			hiddenFromList: false,
			default: 800,
			description: 'Start focus Y',
		},
		endFocusX: {
			type: 'number',
			hiddenFromList: false,
			default: 1280,
			description: 'End focus X',
		},
		endFocusY: {
			type: 'number',
			hiddenFromList: false,
			default: 800,
			description: 'End focus Y',
		},
		zoom: {
			type: 'number',
			hiddenFromList: false,
			default: 1,
			min: 0.1,
			step: 0.05,
			description: 'Start zoom',
		},
		endZoom: {
			type: 'number',
			hiddenFromList: false,
			default: 1,
			min: 0.1,
			step: 0.05,
			description: 'End zoom',
		},
		rotation: {
			type: 'rotation-css',
			default: '0deg',
			description: 'Start angle',
		},
		endRotation: {
			type: 'rotation-css',
			default: '0deg',
			description: 'End angle',
		},
	},
});
