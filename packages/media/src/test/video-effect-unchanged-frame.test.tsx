import {Player, type PlayerRef} from '@remotion/player';
import React from 'react';
import {flushSync} from 'react-dom';
import {createRoot} from 'react-dom/client';
import {createEffect} from 'remotion';
import {expect, test} from 'vitest';
import {Video} from '../video/video';
import {findLargestCanvas, wait, waitFor} from './player-frame-accuracy-utils';

// https://github.com/remotion-dev/remotion/issues/12701
test('does not rerun effects while a 24fps video holds a frame in a 60fps composition', async () => {
	let applications = 0;
	let presentedFrames = 0;
	const effect = createEffect<{tint: number}, null>({
		type: 'unchanged-frame',
		label: 'Unchanged frame',
		backend: '2d',
		documentationLink: null,
		schema: {},
		calculateKey: ({tint}) => `${tint}`,
		validateParams: () => {},
		setup: () => null,
		cleanup: () => {},
		apply: ({source, target, width, height, params}) => {
			applications++;
			const ctx = target.getContext('2d')!;
			ctx.drawImage(source, 0, 0, width, height);
			ctx.fillStyle = `rgb(255, ${params.tint}, 0)`;
			ctx.fillRect(0, 0, 1, 1);
		},
	});
	const Composition = ({tint}: {readonly tint: number}) => (
		<Video
			src="/bigbuckbunny.mp4"
			muted
			effects={[effect({tint})]}
			onVideoFrame={() => {
				presentedFrames++;
			}}
		/>
	);

	const container = document.createElement('div');
	document.body.appendChild(container);
	const root = createRoot(container);
	const ref = React.createRef<PlayerRef>();
	const render = (tint: number) =>
		flushSync(() =>
			root.render(
				<Player
					ref={ref}
					component={Composition}
					inputProps={{tint}}
					compositionWidth={320}
					compositionHeight={180}
					durationInFrames={300}
					fps={60}
					initiallyMuted
					numberOfSharedAudioTags={0}
				/>,
			),
		);
	const pixel = () =>
		Array.from(
			findLargestCanvas(container).getContext('2d')!.getImageData(0, 0, 1, 1)
				.data,
		);
	const seekTo = async (frame: number) => {
		const presentedBefore = presentedFrames;
		flushSync(() => ref.current!.seekTo(frame));
		await waitFor(() => presentedFrames > presentedBefore);
	};

	try {
		render(0);
		await waitFor(() => applications > 0);
		await wait(200);
		const initialApplications = applications;

		await seekTo(1);
		await seekTo(2);
		expect(applications).toBe(initialApplications);
		expect(pixel()).toEqual([255, 0, 0, 255]);

		await seekTo(3);
		expect(applications).toBe(initialApplications + 1);

		render(100);
		await waitFor(() => pixel()[1] === 100);
		expect(applications).toBe(initialApplications + 2);
	} finally {
		root.unmount();
		container.remove();
	}
});
