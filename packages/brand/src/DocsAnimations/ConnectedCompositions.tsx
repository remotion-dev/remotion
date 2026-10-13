import type {ReactNode} from 'react';
import {Composition, Interactive, useVideoConfig} from 'remotion';

type TitleProps = {
	readonly children: ReactNode;
	readonly color: string;
};

const TitleInner = ({children, color}: TitleProps) => (
	<div
		style={{
			fontFamily: 'Arial, sans-serif',
			fontSize: 80,
			textAlign: 'center',
			color,
		}}
	>
		{children}
	</div>
);

export const Title = Interactive.withSchema({
	Component: TitleInner,
	componentName: 'Title',
	schema: {
		...Interactive.childrenSchema,
		color: {type: 'color', default: '#0b84f3', description: 'Text color'},
	},
	wrapInSequence: true,
	layout: 'absolute-fill',
});

const MyVideo = () => {
	const {fps} = useVideoConfig();

	return (
		<>
			<Title color="#0b84f3" durationInFrames={2 * fps}>
				Hello
			</Title>
			<Title color="#9b5de5" from={2 * fps} durationInFrames={2 * fps}>
				World
			</Title>
		</>
	);
};

export const ConnectedCompositionExamples = () => (
	<>
		<Composition
			id="MyVideo"
			component={MyVideo}
			width={1280}
			height={720}
			fps={30}
			durationInFrames={120}
		/>
		<Composition
			id="Title"
			component={Title}
			width={1280}
			height={720}
			fps={30}
			durationInFrames={60}
			defaultProps={{children: 'Hello World!', color: '#0b84f3'}}
		/>
	</>
);
