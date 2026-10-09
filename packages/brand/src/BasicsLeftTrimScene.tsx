import {AbsoluteFill, Composition, Interactive, useVideoConfig} from 'remotion';
import {BasicsLeftTrimPreview} from './BasicsLeftTrimComposition';
import {BasicsTitlePanel} from './BasicsTitlePanel';

const BasicsLeftTrimSceneInner = () => {
	const {fps, width} = useVideoConfig();

	return (
		<AbsoluteFill showInTimeline={false} style={{backgroundColor: '#111518'}}>
			<BasicsLeftTrimPreview
				trimBefore={4.5 * fps}
				durationInFrames={3 * fps}
				premountFor={fps}
				style={{width: (width * 2) / 3}}
				captureStyle={{translate: '-980px -480px'}}
			/>
			<BasicsTitlePanel premountFor={fps} style={null}>
				Left Trim
			</BasicsTitlePanel>
		</AbsoluteFill>
	);
};

export const BasicsLeftTrimScene = Interactive.withSchema({
	Component: BasicsLeftTrimSceneInner,
	componentName: 'BasicsLeftTrimScene',
	schema: {},
	wrapInSequence: true,
	layout: 'absolute-fill',
});

export const BasicsLeftTrimSceneComposition = () => {
	return (
		<Composition
			id="BasicsLeftTrimScene"
			component={BasicsLeftTrimScene}
			width={1920}
			height={1080}
			fps={60}
			durationInFrames={180}
		/>
	);
};
