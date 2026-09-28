import {Audio} from '@remotion/media';
import {useWindowedAudioData, visualizeAudio} from '@remotion/media-utils';
import React from 'react';
import {
	Interactive,
	useCurrentFrame,
	useVideoConfig,
	type InteractiveTransformProps,
	type InteractivitySchema,
} from 'remotion';

type MirroredAudioSpectrumProps = InteractiveTransformProps & {
	readonly audioSrc?: string;
	readonly barColor?: string;
	readonly numberOfBars?: number;
	readonly sensitivity?: number;
};

const mirroredAudioSpectrumSchema = {
	audioSrc: {
		type: 'asset',
		assetType: 'audio',
		default:
			'https://remotion.media/elements/remotion-made-this-picture-move.mp3',
		description: 'Audio source',
	},
	barColor: {
		type: 'color',
		default: '#0b84f3',
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
	sensitivity: {
		type: 'number',
		min: 0.25,
		max: 3,
		step: 0.05,
		default: 1.5,
		description: 'Sensitivity',
		hiddenFromList: false,
	},
	...Interactive.transformSchema,
} as const satisfies InteractivitySchema;

const MirroredAudioSpectrumContent: React.FC<MirroredAudioSpectrumProps> = ({
	audioSrc = 'https://remotion.media/elements/remotion-made-this-picture-move.mp3',
	barColor = '#0b84f3',
	numberOfBars = 65,
	sensitivity = 1.5,
	style,
}) => {
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
						height: Math.max(
							4,
							Math.min(300, 300 * Math.sqrt(value) * sensitivity),
						),
						minWidth: 2,
					}}
				/>
			))}
		</div>
	);
};

export const MirroredAudioSpectrum = Interactive.withSchema({
	Component: MirroredAudioSpectrumContent,
	componentName: '<MirroredAudioSpectrum>',
	schema: mirroredAudioSpectrumSchema,
	wrapInSequence: true,
});
