import {AbsoluteFill, Composition, Interactive, useVideoConfig} from 'remotion';
import {BasicsSourceOnlyTrimPreview} from './BasicsSourceOnlyTrimComposition';
import {BasicsTitlePanel} from './BasicsTitlePanel';

const BasicsSourceOnlyTrimSceneInner = () => {
	const {fps, width} = useVideoConfig();

	return (
		<AbsoluteFill showInTimeline={false} style={{backgroundColor: '#111518'}}>
			<BasicsSourceOnlyTrimPreview
				trimBefore={1.5 * fps}
				durationInFrames={3 * fps}
				premountFor={fps}
				style={{width: (width * 2) / 3}}
				captureStyle={{translate: '-990px -520px'}}
			/>
			<BasicsTitlePanel premountFor={fps} style={null}>
				{'Source-only\ntrim'}
			</BasicsTitlePanel>
		</AbsoluteFill>
	);
};

export const BasicsSourceOnlyTrimScene = Interactive.withSchema({
	Component: BasicsSourceOnlyTrimSceneInner,
	componentName: '<BasicsSourceOnlyTrimScene>',
	schema: {},
	wrapInSequence: true,
	layout: 'absolute-fill',
});

export const BasicsSourceOnlyTrimSceneComposition = () => {
	return (
		<Composition
			id="BasicsSourceOnlyTrimScene"
			component={BasicsSourceOnlyTrimScene}
			width={1920}
			height={1080}
			fps={60}
			durationInFrames={180}
		/>
	);
};
