import React from 'react';
import {Composition} from 'remotion';
import {BrowserTest} from './BrowserTest';

export const BrowserTestRoot: React.FC = () => {
	return (
		<Composition
			id="browser-test"
			component={BrowserTest}
			width={1280}
			height={720}
			fps={30}
			durationInFrames={2 * 60 * 30}
		/>
	);
};
