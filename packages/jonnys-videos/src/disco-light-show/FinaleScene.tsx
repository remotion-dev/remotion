import {Interactive} from 'remotion';
import {Countdown, COUNTDOWN_DURATION_IN_FRAMES} from './Countdown';
import {
	TextBehindVideoSeriesFirst20sComposition,
	TEXT_BEHIND_VIDEO_SERIES_FIRST_20S_DURATION_IN_FRAMES,
} from './TextBehindVideoSeriesFirst20s';

const FinaleSceneInner = () => {
	return (
		<>
			<Countdown
				name="Countdown"
				from={0}
				durationInFrames={COUNTDOWN_DURATION_IN_FRAMES}
				width={1080}
				height={1920}
			/>
			<TextBehindVideoSeriesFirst20sComposition
				name="TextBehindVideoSeriesFirst20s"
				from={92}
				durationInFrames={TEXT_BEHIND_VIDEO_SERIES_FIRST_20S_DURATION_IN_FRAMES}
				width={1080}
				height={1920}
			/>
		</>
	);
};

export const FinaleScene = Interactive.create({
	Component: FinaleSceneInner,
	layout: 'absolute-fill',
});
