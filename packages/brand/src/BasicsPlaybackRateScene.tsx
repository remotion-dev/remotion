import type React from 'react';
import {AbsoluteFill, Composition, Interactive, useVideoConfig} from 'remotion';
import {BasicsPlaybackRatePreview} from './BasicsPlaybackRateComposition';
import {BasicsTitlePanel} from './BasicsTitlePanel';

const BasicsPlaybackRateSceneInner = ({
	style,
}: {
	readonly style: React.CSSProperties | null;
}) => {
	const {fps, width} = useVideoConfig();

	return (
		<AbsoluteFill style={{backgroundColor: '#111518', ...style}}>
			<BasicsPlaybackRatePreview
				trimBefore={0.9 * fps}
				durationInFrames={4.5 * fps}
				playbackRate={1.5}
				premountFor={fps}
				style={{width: (width * 2) / 3}}
				captureStyle={{translate: '-140px -460px'}}
			/>
			<BasicsTitlePanel premountFor={fps} style={null}>
				Playback rate
			</BasicsTitlePanel>
		</AbsoluteFill>
	);
};

export const BasicsPlaybackRateScene = Interactive.withSchema({
	Component: BasicsPlaybackRateSceneInner,
	componentName: '<BasicsPlaybackRateScene>',
	schema: {},
	wrapInSequence: true,
});

export const BasicsPlaybackRateSceneComposition = () => {
	return (
		<Composition
			id="BasicsPlaybackRateScene"
			component={BasicsPlaybackRateScene}
			width={1920}
			height={1080}
			fps={60}
			durationInFrames={180}
			defaultProps={{style: null}}
		/>
	);
};
