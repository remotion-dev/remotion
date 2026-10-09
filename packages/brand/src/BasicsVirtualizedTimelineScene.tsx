import {AbsoluteFill, Composition, Interactive, useVideoConfig} from 'remotion';
import {BasicsTitlePanel} from './BasicsTitlePanel';
import {BasicsVirtualizedTimelinePreview} from './BasicsVirtualizedTimelineComposition';

const BasicsVirtualizedTimelineSceneInner = () => {
	const {fps, width} = useVideoConfig();

	return (
		<AbsoluteFill showInTimeline={false} style={{backgroundColor: '#111518'}}>
			<BasicsVirtualizedTimelinePreview
				trimBefore={4.5 * fps}
				durationInFrames={3 * fps}
				premountFor={fps}
				style={{width: (width * 2) / 3}}
				captureStyle={{translate: '-80px -480px'}}
			/>
			<BasicsTitlePanel premountFor={fps} style={null}>
				Virtualized timeline
			</BasicsTitlePanel>
		</AbsoluteFill>
	);
};

export const BasicsVirtualizedTimelineScene = Interactive.withSchema({
	Component: BasicsVirtualizedTimelineSceneInner,
	componentName: 'BasicsVirtualizedTimelineScene',
	schema: {},
	wrapInSequence: true,
	layout: 'absolute-fill',
});

export const BasicsVirtualizedTimelineSceneComposition = () => {
	return (
		<Composition
			id="BasicsVirtualizedTimelineScene"
			component={BasicsVirtualizedTimelineScene}
			width={1920}
			height={1080}
			fps={60}
			durationInFrames={180}
		/>
	);
};
