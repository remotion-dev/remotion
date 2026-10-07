import type React from 'react';
import {AbsoluteFill, Composition, Interactive, useVideoConfig} from 'remotion';
import {BasicsSourceOnlyTrimPreview} from './BasicsSourceOnlyTrimComposition';
import {BasicsTitlePanel} from './BasicsTitlePanel';

const BasicsSourceOnlyTrimSceneInner = ({
	style,
}: {
	readonly style: React.CSSProperties | null;
}) => {
	const {fps, width} = useVideoConfig();

	return (
		<AbsoluteFill style={{backgroundColor: '#111518', ...style}}>
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
			defaultProps={{style: null}}
		/>
	);
};
