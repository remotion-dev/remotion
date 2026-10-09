import {AbsoluteFill, Composition, Interactive, useVideoConfig} from 'remotion';
import {BasicsTitlePanel} from './BasicsTitlePanel';
import {BasicsVolumeKeyframesPreview} from './BasicsVolumeKeyframesComposition';

const BasicsVolumeKeyframesSceneInner = () => {
	const {fps, width} = useVideoConfig();

	return (
		<AbsoluteFill showInTimeline={false} style={{backgroundColor: '#111518'}}>
			<BasicsVolumeKeyframesPreview
				trimBefore={25.05 * fps}
				durationInFrames={3 * fps}
				premountFor={fps}
				style={{width: (width * 2) / 3}}
				captureStyle={{translate: '-1095px -570px'}}
			/>
			<BasicsTitlePanel premountFor={fps} style={null}>
				Volume keyframes
			</BasicsTitlePanel>
		</AbsoluteFill>
	);
};

export const BasicsVolumeKeyframesScene = Interactive.withSchema({
	Component: BasicsVolumeKeyframesSceneInner,
	componentName: 'BasicsVolumeKeyframesScene',
	schema: {},
	wrapInSequence: true,
	layout: 'absolute-fill',
});

export const BasicsVolumeKeyframesSceneComposition = () => {
	return (
		<Composition
			id="BasicsVolumeKeyframesScene"
			component={BasicsVolumeKeyframesScene}
			width={1920}
			height={1080}
			fps={60}
			durationInFrames={180}
		/>
	);
};
