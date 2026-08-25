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
		readonly backgroundColor?: string;
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
	backgroundColor: {
		type: 'color',
		default: '#07111f',
		description: 'Background color',
	},
	lineColor: {
		type: 'color',
		default: '#55e6ff',
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

const AudioOscilloscopeInner = forwardRef<
	HTMLDivElement,
	AudioOscilloscopeProps & {readonly controls: SequenceControls | undefined}
>(
	(
		{
			amplitude = 2,
			audioSrc = 'https://remotion.media/elements/remotion-made-this-picture-move.mp3',
			backgroundColor = '#07111f',
			controls,
			lineColor = '#55e6ff',
			lineWidth = 6,
			name,
			style,
			windowInSeconds = 0.35,
			...sequenceProps
		},
		ref,
	) => {
		const frame = useCurrentFrame();
		const {fps} = useVideoConfig();
		const outlineRef = useRef<HTMLDivElement>(null);
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
				x: (index / (waveform.length - 1)) * 900,
				y: 150 + value * 150 * amplitude,
			})),
		});

		useImperativeHandle(ref, () => outlineRef.current as HTMLDivElement, []);

		return (
			<Sequence
				layout="none"
				{...sequenceProps}
				controls={controls}
				name={name ?? 'Audio oscilloscope'}
				outlineRef={outlineRef}
			>
				<div
					ref={outlineRef}
					style={{
						backgroundColor,
						backgroundImage:
							'linear-gradient(rgba(255, 255, 255, 0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.055) 1px, transparent 1px)',
						backgroundSize: '45px 45px',
						borderRadius: 32,
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
