import {Easing, Interactive, interpolate, useCurrentFrame} from 'remotion';
import {BirthdayPartyCompilation} from './BirthdayPartyCompilation';
import {TextBackgroundComposition} from './TextBackgroundComposition';

const OpeningSceneInner = () => {
	const frame = useCurrentFrame();
	return (
		<>
			<TextBackgroundComposition
				playbackRate={201 / 181}
				name="Text background"
				width={1920}
				height={1080}
				durationInFrames={201}
				style={{
					position: 'absolute',
					transformOrigin: '0% 0%',
					translate: interpolate(
						frame,
						[0, 54, 72, 113, 128, 164],
						[
							'-565px -40px',
							'-565px -40px',
							'-310px -140px',
							'-310px -140px',
							'-640px -140px',
							'-640px -140px',
						],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.inOut(Easing.cubic),
						},
					),
					scale: interpolate(
						frame,
						[0, 54, 72, 164],
						[1.12, 1.12, 1.24, 1.24],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.inOut(Easing.cubic),
						},
					),
				}}
			/>
			<BirthdayPartyCompilation
				playbackRate={178 / 160}
				name="BirthdayPartyCompilation"
				width={1080}
				height={1920}
				durationInFrames={178}
				style={{
					position: 'absolute',
				}}
				from={165}
			/>
		</>
	);
};

export const OpeningScene = Interactive.create({
	Component: OpeningSceneInner,
	layout: 'absolute-fill',
});
