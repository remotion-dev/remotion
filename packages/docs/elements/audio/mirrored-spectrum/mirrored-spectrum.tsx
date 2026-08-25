import {Audio} from '@remotion/media';
import {useWindowedAudioData, visualizeAudio} from '@remotion/media-utils';
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

type MirroredAudioSpectrumProps = InteractiveBaseProps &
	InteractiveTransformProps & {
		readonly audioSrc?: string;
		readonly barColor?: string;
		readonly numberOfBars?: number;
	};

const mirroredAudioSpectrumSchema = {
	...Interactive.baseSchema,
	audioSrc: {
		type: 'asset',
		default:
			'https://remotion.media/elements/remotion-made-this-picture-move.mp3',
		description: 'Audio source',
	},
	barColor: {
		type: 'color',
		default: '#f4b941',
		description: 'Bar color',
	},
	numberOfBars: {
		type: 'number',
		min: 3,
		max: 127,
		step: 2,
		default: 65,
		description: 'Number of bars',
		hiddenFromList: false,
		keyframable: false,
	},
	...Interactive.transformSchema,
} as const satisfies InteractivitySchema;

const MirroredAudioSpectrumContent: React.FC<{
	readonly audioSrc: string;
	readonly barColor: string;
	readonly numberOfBars: number;
	readonly outlineRef: React.RefObject<HTMLDivElement | null>;
	readonly style: MirroredAudioSpectrumProps['style'];
}> = ({audioSrc, barColor, numberOfBars, outlineRef, style}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {audioData, dataOffsetInSeconds} = useWindowedAudioData({
		fps,
		frame,
		src: audioSrc,
		windowInSeconds: 10,
	});
	const roundedNumberOfBars = Math.max(
		3,
		Math.min(127, Math.round(numberOfBars)),
	);
	const numberOfFrequencies = Math.ceil(roundedNumberOfBars / 2);
	const frequencyData = audioData
		? visualizeAudio({
				audioData,
				dataOffsetInSeconds,
				fps,
				frame,
				numberOfSamples: 256,
				optimizeFor: 'speed',
			})
		: [];
	const frequencyDataSubset = frequencyData.slice(0, numberOfFrequencies);
	const frequenciesToDisplay = [
		...frequencyDataSubset.slice(roundedNumberOfBars % 2).reverse(),
		...frequencyDataSubset,
	];

	return (
		<div
			ref={outlineRef}
			style={{
				alignItems: 'center',
				boxSizing: 'border-box',
				display: 'flex',
				gap: 8,
				height: 300,
				justifyContent: 'center',
				width: 900,
				...style,
			}}
		>
			<Audio showInTimeline={false} src={audioSrc} />
			{frequenciesToDisplay.map((value, index) => (
				<div
					key={index}
					style={{
						backgroundColor: barColor,
						borderRadius: 999,
						flex: 1,
						height: Math.max(4, 300 * Math.sqrt(value)),
						minWidth: 2,
					}}
				/>
			))}
		</div>
	);
};

const MirroredAudioSpectrumInner = forwardRef<
	HTMLDivElement,
	MirroredAudioSpectrumProps & {readonly controls: SequenceControls | undefined}
>(
	(
		{
			audioSrc = 'https://remotion.media/elements/remotion-made-this-picture-move.mp3',
			barColor = '#f4b941',
			controls,
			name,
			numberOfBars = 65,
			style,
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
				name={name ?? '<MirroredAudioSpectrum>'}
				outlineRef={outlineRef}
			>
				<MirroredAudioSpectrumContent
					audioSrc={audioSrc}
					barColor={barColor}
					numberOfBars={numberOfBars}
					outlineRef={outlineRef}
					style={style}
				/>
			</Sequence>
		);
	},
);

const InteractiveMirroredAudioSpectrum = Interactive.withSchema({
	Component: MirroredAudioSpectrumInner,
	componentName: '<MirroredAudioSpectrum>',
	componentIdentity: null,
	schema: mirroredAudioSpectrumSchema,
	supportsEffects: false,
}) as React.FC<MirroredAudioSpectrumProps>;

export const MirroredAudioSpectrum: React.FC<MirroredAudioSpectrumProps> = (
	props,
) => {
	return (
		<InteractiveMirroredAudioSpectrum
			audioSrc="https://remotion.media/elements/remotion-made-this-picture-move.mp3"
			barColor="#f4b941"
			name="Mirrored audio spectrum"
			numberOfBars={65}
			{...props}
		/>
	);
};
