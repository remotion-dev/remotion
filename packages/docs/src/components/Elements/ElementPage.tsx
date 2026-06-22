import React, {type ComponentType, type ReactNode} from 'react';
import {ElementPreview} from './ElementPreview';

type ElementPageProps = {
	readonly component: ComponentType<Record<string, never>>;
	readonly durationInFrames?: number;
	readonly fps?: number;
	readonly height?: number;
	readonly width?: number;
	readonly children: ReactNode;
};

export const ElementPage: React.FC<ElementPageProps> = ({
	children,
	component,
	durationInFrames = 120,
	fps = 30,
	height = 1080,
	width = 1920,
}) => {
	return (
		<>
			<h2>Preview</h2>
			<ElementPreview
				component={component}
				durationInFrames={durationInFrames}
				fps={fps}
				height={height}
				width={width}
			/>

			<h2>Use it</h2>
			<p>
				Copy the source code into your Remotion project. The file exports the
				Element component. Preview dimensions, frame rate, and duration are
				supplied by the gallery.
			</p>

			<h2>Source</h2>
			{children}
		</>
	);
};
