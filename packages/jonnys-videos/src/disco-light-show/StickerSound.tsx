import {Audio} from '@remotion/media';
import {Interactive, useVideoConfig} from 'remotion';
import {asset} from './assets';

const StickerSoundInner = ({
	large,
	pitch,
}: {
	readonly large: boolean;
	readonly pitch: number;
}) => {
	const {fps} = useVideoConfig();

	return (
		<>
			<Audio
				name={large ? 'Silk page-turn swish' : 'Unfold paper flutter'}
				src={asset(
					large
						? 'sound-lab-silk-9afd9eb970ab.wav'
						: 'sound-lab-unfold-e5a3f0872f23.wav',
				)}
				playbackRate={large ? 1.65 : 1.25}
				toneFrequency={pitch}
				volume={large ? 0.5 : 0.42}
			/>
			<Audio
				name="Sticker landing tap"
				src={asset('sound-lab-place-decff05333a7.wav')}
				from={(large ? 0.4 : 0.2) * fps}
				toneFrequency={pitch}
				volume={large ? 0.2 : 0.14}
			/>
		</>
	);
};

export const StickerSound = Interactive.create({
	Component: StickerSoundInner,
	schema: {
		large: {type: 'boolean', default: false, description: 'Large sticker'},
		pitch: {
			type: 'number',
			default: 1,
			min: 0.5,
			max: 1.5,
			step: 0.01,
			description: 'Pitch',
			hiddenFromList: false,
		},
	},
	layout: 'absolute-fill',
});
