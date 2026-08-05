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

		await new Promise((resolve) => setTimeout(resolve, 10));
	}

	throw new Error('Timed out waiting for condition');
};

test('applies crop props to the Video canvas', async () => {
	const container = document.createElement('div');
	document.body.appendChild(container);

	const Composition: React.FC = () => {
		return (
			<Video
				cropBottom={0.4}
				cropLeft={0.1}
				cropRight={0.2}
				cropTop={0.3}
				data-testid="cropped-video"
				src="/bigbuckbunny.mp4"
			/>
		);
	};

	const root = createRoot(container);
	root.render(
		<Player
			acknowledgeRemotionLicense
			component={Composition}
			compositionHeight={720}
			compositionWidth={1280}
			durationInFrames={100}
			fps={30}
			initiallyMuted
			inputProps={{}}
		/>,
	);

	try {
		await waitFor(
			() => container.querySelector('[data-testid="cropped-video"]') !== null,
		);
		const canvas = container.querySelector(
			'[data-testid="cropped-video"]',
		) as HTMLCanvasElement;
		expect(canvas).toBeInstanceOf(HTMLCanvasElement);
		expect(canvas.style.clipPath).toBe('inset(30% 20% 40% 10%)');
	} finally {
		root.unmount();
		container.remove();
	}
});
