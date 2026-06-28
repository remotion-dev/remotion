import {Player} from '@remotion/player';
import React, {useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {expect, test, vi} from 'vitest';
import {MediaPlayer} from '../media-player';
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

test('does not reinitialize MediaPlayer when onError identity changes', async () => {
	const container = document.createElement('div');
	document.body.appendChild(container);

	const initSpy = vi.spyOn(MediaPlayer.prototype, 'initialize');
	const root = createRoot(container);
	let committedRerenders = 0;

	const VideoComposition: React.FC = () => {
		const [rerenders, setRerenders] = useState(0);

		useEffect(() => {
			const interval = window.setInterval(() => {
				setRerenders((current) => {
					if (current >= 4) {
						window.clearInterval(interval);
						return current;
					}

					return current + 1;
				});
			}, 50);

			return () => window.clearInterval(interval);
		}, []);

		useEffect(() => {
			committedRerenders = rerenders;
		}, [rerenders]);

		return <Video src="/bigbuckbunny.mp4" onError={() => {}} />;
	};

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
			return (
				renderedCanvas?.width === 1280 &&
				renderedCanvas.height === 720 &&
				committedRerenders >= 4
			);
		});

		expect(initSpy.mock.calls.length).toBe(1);
	} finally {
		root.unmount();
		container.remove();
		initSpy.mockRestore();
	}
});
