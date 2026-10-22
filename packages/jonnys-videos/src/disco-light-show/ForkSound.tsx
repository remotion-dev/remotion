import {Audio} from '@remotion/media';
import {Interactive, useVideoConfig} from 'remotion';
import {asset} from './assets';

const ForkSoundInner = () => {
	const {fps} = useVideoConfig();

	return (
		<>
			<Audio
				name="Fah"
				src={asset('fahhhh.mp3')}
				volume={0.045}
				toneFrequency={0.88}
			/>
			<Audio
				name="Fah echo"
				src={asset('fahhhh.mp3')}
				from={Math.round(0.12 * fps)}
				volume={0.008}
				toneFrequency={0.8}
			/>
		</>
	);
};

export const ForkSound = Interactive.create({
	Component: ForkSoundInner,
	layout: 'absolute-fill',
});
