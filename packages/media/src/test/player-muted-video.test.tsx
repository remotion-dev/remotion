import {Player} from '@remotion/player';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {expect, test} from 'vitest';
import {Video} from '../video/video';

const waitFor = async (predicate: () => boolean) => {
	const started = Date.now();
	while (Date.now() - started < 10000) {
		if (predicate()) {
			return;
		}

		await new Promise((resolve) => setTimeout(resolve, 100));
	}

	throw new Error('Timed out waiting for condition');
};

const VideoComposition: React.FC = () => {
	return <Video src="/bigbuckbunny.mp4" />;
};

test('renders a video in an initially muted Player', async () => {
	const container = document.createElement('div');
	document.body.appendChild(container);

	const root = createRoot(container);
	root.render(
		<Player
			acknowledgeRemotionLicense
			component={VideoComposition}
			compositionHeight={720}
			compositionWidth={1280}
			durationInFrames={100}
			fps={30}
			initiallyMuted
			inputProps={{}}
		/>,
	);

	try {
		await waitFor(() => {
			const renderedCanvas = container.querySelector('canvas');
			return renderedCanvas?.width === 1280 && renderedCanvas.height === 720;
		});

		const canvas = container.querySelector('canvas');
		expect(canvas?.width).toBe(1280);
		expect(canvas?.height).toBe(720);
	} finally {
		root.unmount();
		container.remove();
	}
});
