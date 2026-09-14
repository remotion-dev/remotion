import {Player} from '@remotion/player';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {Html5Video} from 'remotion';
import {expect, test} from 'vitest';

test('preserves the Player media playback rate across source changes and reloads', async () => {
	const container = document.createElement('div');
	document.body.appendChild(container);
	const root = createRoot(container);
	const Composition: React.FC<{readonly src: string}> = ({src}) => (
		<Html5Video src={src} playbackRate={0.6} />
	);

	try {
		for (const [index, globalRate] of [1, 0.5].entries()) {
			root.render(
				<Player
					acknowledgeRemotionLicense
					component={Composition}
					compositionHeight={720}
					compositionWidth={1280}
					durationInFrames={100}
					fps={30}
					initiallyMuted
					playbackRate={globalRate}
					inputProps={{src: `/bigbuckbunny.mp4?source=${index}`}}
				/>,
			);
			await expect
				.poll(() => container.querySelector('video')?.readyState)
				.toBe(4);
			const video = container.querySelector('video')!;
			await expect.poll(() => video.playbackRate).toBe(0.6 * globalRate);

			// Loading a new resource resets playbackRate to defaultPlaybackRate.
			video.src = `/bigbuckbunny.mp4?reload=${index}`;
			video.load();
			await expect.poll(() => video.readyState).toBe(4);
			expect(video.playbackRate).toBe(0.6 * globalRate);
		}
	} finally {
		root.unmount();
		container.remove();
	}
});
