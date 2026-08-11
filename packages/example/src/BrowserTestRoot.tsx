import React from 'react';
import {Composition} from 'remotion';
import {BrowserTest} from './BrowserTest';
import {HtmlInCanvasDemo} from './HtmlInCanvas';

export const BrowserTestRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="browser-test"
				component={BrowserTest}
				width={1280}
				height={720}
				fps={30}
				durationInFrames={2 * 60 * 30}
			/>
			<Composition
				id="html-in-canvas"
				component={HtmlInCanvasDemo}
				fps={30}
				height={1080}
				width={1920}
				durationInFrames={120}
			/>
		</>
	);
};
