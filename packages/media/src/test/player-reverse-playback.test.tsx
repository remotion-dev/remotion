import {Player, type PlayerRef} from '@remotion/player';
import React from 'react';
import {flushSync} from 'react-dom';
import {createRoot} from 'react-dom/client';
import {expect, test, vi} from 'vitest';
import {page} from 'vitest/browser';
import {Video} from '../video/video';

test('reverse playback stays silent and resumes audio when playing forward', async () => {
	// Observe real Web Audio starts so invalid offsets still throw in the browser.
	const starts = vi.spyOn(AudioBufferSourceNode.prototype, 'start');
	const startedMediaNodes = () =>
		(starts.mock.contexts as AudioBufferSourceNode[]).filter(
			(node) => node.buffer !== null,
		);
	const onVideoFrame = vi.fn();
	const Composition = () => (
		<Video
			src="/bigbuckbunny.mp4"
			disallowFallbackToOffthreadVideo
			onVideoFrame={onVideoFrame}
		/>
	);
	const container = document.createElement('div');
	document.body.appendChild(container);
	const root = createRoot(container);
	const playerRef = React.createRef<PlayerRef>();
	const renderPlayer = (playbackRate: number) => {
		flushSync(() => {
			root.render(
				<Player
					ref={playerRef}
					acknowledgeRemotionLicense
					component={Composition}
					compositionWidth={320}
					compositionHeight={180}
					controls
					durationInFrames={300}
					fps={30}
					initialFrame={150}
					playbackRate={playbackRate}
					inputProps={{}}
				/>,
			);
		});
	};

	try {
		renderPlayer(1);
		await vi.waitFor(() => expect(onVideoFrame).toHaveBeenCalled(), {
			timeout: 5000,
		});
		await page.getByRole('button', {name: 'Play video'}).click();
		await vi.waitFor(
			() => {
				expect(startedMediaNodes().length).toBeGreaterThan(0);
				expect(playerRef.current!.getCurrentFrame()).toBeGreaterThan(150);
			},
			{timeout: 5000},
		);

		const forwardFrame = playerRef.current!.getCurrentFrame();
		starts.mockClear();
		// J changes the Player's global rate while playback continues.
		renderPlayer(-1);
		await vi.waitFor(
			() => {
				expect(playerRef.current!.getCurrentFrame()).toBeLessThan(
					forwardFrame - 2,
				);
			},
			{timeout: 5000},
		);
		expect(startedMediaNodes()).toHaveLength(0);

		const reverseFrame = playerRef.current!.getCurrentFrame();
		renderPlayer(1);
		await vi.waitFor(
			() => {
				expect(startedMediaNodes().length).toBeGreaterThan(0);
				expect(playerRef.current!.getCurrentFrame()).toBeGreaterThan(
					reverseFrame,
				);
			},
			{timeout: 5000},
		);
	} finally {
		root.unmount();
		container.remove();
		starts.mockRestore();
	}
}, 15000);
