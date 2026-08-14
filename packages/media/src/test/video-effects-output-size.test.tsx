import {Player} from '@remotion/player';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {Internals} from 'remotion';
import {expect, test} from 'vitest';
import {Video} from '../video/video';

const passthrough = Internals.createEffect<
	Record<string, never>,
	CanvasRenderingContext2D
>({
	type: 'dev.remotion.media.test.passthrough',
	label: 'passthrough()',
	documentationLink: null,
	backend: '2d',
	calculateKey: () => 'passthrough',
	setup: (target) => {
		const context = target.getContext('2d');
		if (!context) {
			throw new Error('Could not get 2D context');
		}

		return context;
	},
	apply: ({source, state, width, height}) => {
		state.clearRect(0, 0, width, height);
		state.drawImage(source, 0, 0, width, height);
	},
	cleanup: () => undefined,
	schema: {},
	validateParams: () => undefined,
});

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

test('applies effects at effectsOutputSize in preview', async () => {
	const container = document.createElement('div');
	document.body.appendChild(container);

	const Composition: React.FC = () => {
		return (
			<Video
				data-testid="video"
				effects={[passthrough()]}
				effectsOutputSize={{width: 320, height: 180}}
				muted
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
		await waitFor(() => {
			const currentCanvas = container.querySelector(
				'[data-testid="video"]',
			) as HTMLCanvasElement | null;
			return currentCanvas?.width === 320 && currentCanvas.height === 180;
		});

		const canvas = container.querySelector(
			'[data-testid="video"]',
		) as HTMLCanvasElement;
		expect(canvas.width).toBe(320);
		expect(canvas.height).toBe(180);
	} finally {
		root.unmount();
		container.remove();
	}
});
