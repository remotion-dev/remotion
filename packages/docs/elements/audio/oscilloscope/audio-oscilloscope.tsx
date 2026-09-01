import {Audio} from '@remotion/media';
import {
	createSmoothSvgPath,
	getWaveformPortion,
	useWindowedAudioData,
} from '@remotion/media-utils';
import React, {forwardRef, useImperativeHandle, useRef} from 'react';
import {
	Interactive,
	Sequence,
	useCurrentFrame,
	useVideoConfig,
	type InteractiveBaseProps,
	type InteractiveTransformProps,
	type InteractivitySchema,
	type SequenceControls,
} from 'remotion';

type AudioOscilloscopeProps = InteractiveBaseProps &
	InteractiveTransformProps & {
		readonly amplitude?: number;
		readonly audioSrc?: string;
		readonly lineColor?: string;
		readonly lineWidth?: number;
		readonly windowInSeconds?: number;
	};

const audioOscilloscopeSchema = {
	...Interactive.baseSchema,
	audioSrc: {
		type: 'asset',
		default:
			'https://remotion.media/elements/remotion-made-this-picture-move.mp3',
		description: 'Audio source',
	},
	lineColor: {
		type: 'color',
		default: '#0b84f3',
		description: 'Waveform color',
	},
	lineWidth: {
		type: 'number',
		min: 1,
		max: 16,
		step: 1,
		default: 6,
		description: 'Line width',
		hiddenFromList: false,
	},
	amplitude: {
		type: 'number',
		min: 0.25,
		max: 4,
		step: 0.05,
		default: 2,
		description: 'Amplitude',
		hiddenFromList: false,
	},
	windowInSeconds: {
		type: 'number',
		min: 0.05,
		max: 1,
		step: 0.05,
		default: 0.35,
		description: 'Time window in seconds',
		hiddenFromList: false,
	},
	...Interactive.transformSchema,
} as const satisfies InteractivitySchema;

const AudioOscilloscopeContent: React.FC<{
	readonly amplitude: number;
	readonly audioSrc: string;
	readonly lineColor: string;
	readonly lineWidth: number;
	readonly outlineRef: React.RefObject<HTMLDivElement | null>;
	readonly style: AudioOscilloscopeProps['style'];
	readonly windowInSeconds: number;
}> = ({
	amplitude,
	audioSrc,
	lineColor,
	lineWidth,
	outlineRef,
	style,
	windowInSeconds,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {audioData, dataOffsetInSeconds} = useWindowedAudioData({
		fps,
		frame,
		src: audioSrc,
		windowInSeconds: 10,
	});
	const waveform = audioData
		? getWaveformPortion({
				audioData,
				channel: 0,
				dataOffsetInSeconds,
				durationInSeconds: windowInSeconds,
				normalize: false,
				numberOfSamples: 128,
				outputRange: 'minus-one-to-one',
				startTimeInSeconds: frame / fps - windowInSeconds / 2,
			}).map((sample) => sample.amplitude)
		: [];
	const path = createSmoothSvgPath({
		points: waveform.map((value, index) => ({
			x:
				lineWidth * 2 + (index / (waveform.length - 1)) * (900 - lineWidth * 4),
			y: 150 + value * 150 * amplitude,
		})),
	});

	return (
		<div
			ref={outlineRef}
			style={{
				boxSizing: 'border-box',
				height: 300,
				overflow: 'hidden',
				width: 900,
				...style,
			}}
		>
			<Audio showInTimeline={false} src={audioSrc} />
			<svg height={300} viewBox="0 0 900 300" width={900}>
				<line
					x1={0}
					x2={900}
					y1={150}
					y2={150}
					stroke={lineColor}
					strokeOpacity={0.18}
					strokeWidth={1}
				/>
				{path ? (
					<>
						<path
							d={path}
							fill="none"
							stroke={lineColor}
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeOpacity={0.22}
							strokeWidth={lineWidth * 4}
						/>
						<path
							d={path}
							fill="none"
							stroke={lineColor}
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={lineWidth}
						/>
					</>
				) : null}
			</svg>
		</div>
	);
};

const AudioOscilloscopeInner = forwardRef<
	HTMLDivElement,
	AudioOscilloscopeProps & {readonly controls: SequenceControls | undefined}
>(
	(
		{
			amplitude = 2,
			audioSrc = 'https://remotion.media/elements/remotion-made-this-picture-move.mp3',
			controls,
			lineColor = '#0b84f3',
			lineWidth = 6,
			name,
			style,
			windowInSeconds = 0.35,
			...sequenceProps
		},
		ref,
	) => {
		const outlineRef = useRef<HTMLDivElement>(null);

		useImperativeHandle(ref, () => outlineRef.current as HTMLDivElement, []);

		return (
			<Sequence
				layout="none"
				{...sequenceProps}
				controls={controls}
				name={name ?? 'Audio oscilloscope'}
				outlineRef={outlineRef}
			>
				<AudioOscilloscopeContent
					amplitude={amplitude}
					audioSrc={audioSrc}
					lineColor={lineColor}
					lineWidth={lineWidth}
					outlineRef={outlineRef}
					style={style}
					windowInSeconds={windowInSeconds}
				/>
			</Sequence>
		);
	},
);

export const AudioOscilloscope = Interactive.withSchema({
	Component: AudioOscilloscopeInner,
	componentName: '<AudioOscilloscope>',
	componentIdentity: null,
	schema: audioOscilloscopeSchema,
	supportsEffects: false,
}) as React.FC<AudioOscilloscopeProps>;
