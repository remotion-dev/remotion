import {Audio} from '@remotion/media';
import {getWaveformPortion, useWindowedAudioData} from '@remotion/media-utils';
import React, {
	forwardRef,
	useId,
	useImperativeHandle,
	useMemo,
	useRef,
} from 'react';
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

type AudioWaveformProgressProps = InteractiveBaseProps &
	InteractiveTransformProps & {
		readonly amplitude?: number;
		readonly audioSrc?: string;
		readonly barGap?: number;
		readonly numberOfBars?: number;
		readonly playedColor?: string;
		readonly unplayedColor?: string;
	};

const audioWaveformProgressSchema = {
	...Interactive.baseSchema,
	audioSrc: {
		type: 'asset',
		default:
			'https://remotion.media/elements/remotion-made-this-picture-move.mp3',
		description: 'Audio source',
	},
	playedColor: {
		type: 'color',
		default: '#0b84f3',
		description: 'Played color',
	},
	unplayedColor: {
		type: 'color',
		default: '#cbd5e1',
		description: 'Unplayed color',
	},
	numberOfBars: {
		type: 'number',
		min: 12,
		max: 96,
		step: 1,
		default: 64,
		description: 'Number of bars',
		hiddenFromList: false,
		keyframable: false,
	},
	barGap: {
		type: 'number',
		min: 0,
		max: 8,
		step: 1,
		default: 5,
		description: 'Gap between bars',
		hiddenFromList: false,
		keyframable: false,
	},
	amplitude: {
		type: 'number',
		min: 0.25,
		max: 2,
		step: 0.05,
		default: 1,
		description: 'Amplitude',
		hiddenFromList: false,
	},
	...Interactive.transformSchema,
} as const satisfies InteractivitySchema;

const AudioWaveformProgressContent: React.FC<{
	readonly amplitude: number;
	readonly audioSrc: string;
	readonly barGap: number;
	readonly durationInFrames: number;
	readonly numberOfBars: number;
	readonly playedColor: string;
	readonly unplayedColor: string;
}> = ({
	amplitude,
	audioSrc,
	barGap,
	durationInFrames,
	numberOfBars,
	playedColor,
	unplayedColor,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const durationInSeconds = durationInFrames / fps;
	const {audioData, dataOffsetInSeconds} = useWindowedAudioData({
		fps,
		frame: 0,
		src: audioSrc,
		windowInSeconds: durationInSeconds,
	});
	const gradientId = `audio-waveform-progress-${useId().replaceAll(':', '')}`;
	const roundedNumberOfBars = Math.max(
		12,
		Math.min(96, Math.round(numberOfBars)),
	);
	const waveform = useMemo(() => {
		if (!audioData) {
			return [];
		}

		return getWaveformPortion({
			audioData,
			dataOffsetInSeconds,
			durationInSeconds,
			numberOfSamples: roundedNumberOfBars,
			startTimeInSeconds: 0,
		});
	}, [audioData, dataOffsetInSeconds, durationInSeconds, roundedNumberOfBars]);
	const progress = Math.max(
		0,
		Math.min(1, frame / Math.max(1, durationInFrames - 1)),
	);
	const resolvedBarGap = Math.max(0, Math.min(8, barGap));
	const barWidth =
		(884 - resolvedBarGap * (roundedNumberOfBars - 1)) / roundedNumberOfBars;

	return (
		<>
			<Audio showInTimeline={false} src={audioSrc} />
			<svg height={300} viewBox="0 0 900 300" width={900}>
				<defs>
					<linearGradient
						id={gradientId}
						gradientUnits="userSpaceOnUse"
						x1={8}
						x2={892}
						y1={0}
						y2={0}
					>
						<stop offset="0%" stopColor={playedColor} />
						<stop offset={`${progress * 100}%`} stopColor={playedColor} />
						<stop offset={`${progress * 100}%`} stopColor={unplayedColor} />
						<stop offset="100%" stopColor={unplayedColor} />
					</linearGradient>
				</defs>
				{waveform.map((sample, index) => {
					const barHeight = Math.max(
						10,
						Math.min(210, Math.sqrt(sample.amplitude) * 210 * amplitude),
					);

					return (
						<rect
							key={sample.index}
							fill={`url(#${gradientId})`}
							height={barHeight}
							rx={Math.min(barWidth / 2, barHeight / 2)}
							width={barWidth}
							x={8 + index * (barWidth + resolvedBarGap)}
							y={150 - barHeight / 2}
						/>
					);
				})}
			</svg>
		</>
	);
};

const AudioWaveformProgressInner = forwardRef<
	HTMLDivElement,
	AudioWaveformProgressProps & {
		readonly controls: SequenceControls | undefined;
	}
>(
	(
		{
			amplitude = 1,
			audioSrc = 'https://remotion.media/elements/remotion-made-this-picture-move.mp3',
			barGap = 5,
			controls,
			durationInFrames = 271,
			name,
			numberOfBars = 64,
			playedColor = '#0b84f3',
			style,
			unplayedColor = '#cbd5e1',
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
				durationInFrames={durationInFrames}
				name={name ?? 'Audio waveform progress'}
				outlineRef={outlineRef}
			>
				<div
					ref={outlineRef}
					style={{
						boxSizing: 'border-box',
						height: 300,
						width: 900,
						...style,
					}}
				>
					<AudioWaveformProgressContent
						key={`${audioSrc}-${durationInFrames}`}
						amplitude={amplitude}
						audioSrc={audioSrc}
						barGap={barGap}
						durationInFrames={durationInFrames}
						numberOfBars={numberOfBars}
						playedColor={playedColor}
						unplayedColor={unplayedColor}
					/>
				</div>
			</Sequence>
		);
	},
);

export const AudioWaveformProgress = Interactive.withSchema({
	Component: AudioWaveformProgressInner,
	componentName: '<AudioWaveformProgress>',
	componentIdentity: null,
	schema: audioWaveformProgressSchema,
	supportsEffects: false,
}) as React.FC<AudioWaveformProgressProps>;
