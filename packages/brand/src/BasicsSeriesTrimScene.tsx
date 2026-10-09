import {AbsoluteFill, Composition, Interactive, useVideoConfig} from 'remotion';
import {BasicsSeriesTrimPreview} from './BasicsSeriesTrimComposition';
import {BasicsTitlePanel} from './BasicsTitlePanel';

const BasicsSeriesTrimSceneInner = () => {
	const {fps, width} = useVideoConfig();

	return (
		<AbsoluteFill showInTimeline={false} style={{backgroundColor: '#111518'}}>
			<BasicsSeriesTrimPreview
				trimBefore={1.95 * fps}
				durationInFrames={4.5 * fps}
				playbackRate={1.5}
				premountFor={fps}
				style={{width: (width * 2) / 3}}
				captureStyle={{translate: '-1210px 50px'}}
			/>
			<BasicsTitlePanel premountFor={fps} style={null}>
				Series trimming
			</BasicsTitlePanel>
		</AbsoluteFill>
	);
};

export const BasicsSeriesTrimScene = Interactive.withSchema({
	Component: BasicsSeriesTrimSceneInner,
	componentName: '<BasicsSeriesTrimScene>',
	schema: {},
	wrapInSequence: true,
	layout: 'absolute-fill',
});

export const BasicsSeriesTrimSceneComposition = () => {
	return (
		<Composition
			id="BasicsSeriesTrimScene"
			component={BasicsSeriesTrimScene}
			width={1920}
			height={1080}
			fps={60}
			durationInFrames={180}
		/>
	);
};
