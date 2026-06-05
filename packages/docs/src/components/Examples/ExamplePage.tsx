import React, {type ComponentType, type ReactNode} from 'react';
import {ExamplePreview} from './ExamplePreview';

type ExamplePageProps = {
	readonly component: ComponentType<Record<string, never>>;
	readonly durationInFrames: number;
	readonly fps: number;
	readonly height: number;
	readonly width: number;
	readonly children: ReactNode;
};

export const ExamplePage: React.FC<ExamplePageProps> = ({
	children,
	component,
	durationInFrames,
	fps,
	height,
	width,
}) => {
	return (
		<>
			<h2>Preview</h2>
			<ExamplePreview
				component={component}
				durationInFrames={durationInFrames}
				fps={fps}
				height={height}
				width={width}
			/>

			<h2>Use it</h2>
			<p>
				Copy the source code into your Remotion project. The file exports the
				component, dimensions, frame rate, duration, and a{' '}
				<code>RemotionRoot</code>
				composition.
			</p>

			<h2>Source</h2>
			{children}
		</>
	);
};
