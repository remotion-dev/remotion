import {Video} from '@remotion/media';
import {Interactive} from 'remotion';

const EarlyRemotionDemoBrollContent = () => {
	return (
		<div
			style={{
				position: 'absolute',
				left: '50%',
				top: '50%',
				width: 1680,
				height: 945,
				translate: '-50% -50%',
				transformOrigin: 'center',
				boxShadow: '0 16px 48px rgba(0, 0, 0, 0.15)',
			}}
		>
			<Video
				name="November 5, 2020 — explaining the React video"
				src="https://remotion.media/remotion-prototype-2020/00m39s-reveal.mp4"
				trimBefore={110}
				durationInFrames={75}
				muted
				style={{
					position: 'absolute',
					inset: 0,
					width: '100%',
					height: '100%',
				}}
			/>
			<Video
				name="November 5, 2020 — early browser preview and React code"
				src="https://remotion.media/remotion-prototype-2020/01m32s-frame-hook.mp4"
				from={75}
				trimBefore={150}
				durationInFrames={54}
				muted
				style={{
					position: 'absolute',
					inset: 0,
					width: '100%',
					height: '100%',
				}}
			/>
			<Video
				name="Jonny in 2020 — moving lead-in to William"
				src="https://remotion.media/remotion-prototype-2020/02m03s-finally.mp4"
				from={129}
				trimBefore={59}
				durationInFrames={30}
				muted
				style={{
					position: 'absolute',
					inset: 0,
					width: '100%',
					height: '100%',
				}}
			/>
		</div>
	);
};

export const EarlyRemotionDemoBroll = Interactive.create({
	Component: EarlyRemotionDemoBrollContent,
	layout: 'absolute-fill',
	schema: {...Interactive.backgroundSchema},
});
