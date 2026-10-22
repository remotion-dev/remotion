import {Player, type PlayerRef} from '@remotion/player';
import React from 'react';
import {flushSync} from 'react-dom';
import {createRoot} from 'react-dom/client';
import {createEffect, useCurrentFrame} from 'remotion';
import {expect, test} from 'vitest';
import {Video} from '../video/video';
import {findLargestCanvas, waitFor} from './player-frame-accuracy-utils';

test.each([false, true])(
	'coalesces frame/effect updates and preserves paused edits (one-frame loop: %s)',
	async (singleFrameLoop) => {
		const applications: number[] = [];
		const effect = createEffect<{frame: number; tint: number}, null>({
			type: 'redraw-regression',
			label: 'Redraw regression',
			backend: '2d',
			documentationLink: null,
			schema: {},
			calculateKey: ({frame, tint}) => `${frame}-${tint}`,
			validateParams: () => {},
			setup: () => null,
			cleanup: () => {},
			apply: ({target, width, height, params}) => {
				applications.push(params.frame);
				const ctx = target.getContext('2d')!;
				ctx.fillStyle = `rgb(${params.frame + params.tint}, 0, 0)`;
				ctx.fillRect(0, 0, width, height);
			},
		});
		const Composition = ({tint}: {readonly tint: number}) => {
			const frame = useCurrentFrame();
			return (
				<Video
					src="/bigbuckbunny.mp4"
					muted
					trimAfter={singleFrameLoop ? 1 : undefined}
					loop={singleFrameLoop}
					effects={[effect({frame, tint})]}
				/>
			);
		};

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
						fps={30}
						initiallyMuted
						numberOfSharedAudioTags={0}
					/>,
				),
			);
		const red = () =>
			findLargestCanvas(container).getContext('2d')!.getImageData(0, 0, 1, 1)
				.data[0];
		try {
			render(0);
			await waitFor(() => applications.length > 0);
			for (let frame = 1; frame <= 5; frame++) {
				flushSync(() => ref.current!.seekTo(frame));
				await waitFor(() => applications.includes(frame));
				await new Promise((resolve) => setTimeout(resolve, 30));
				expect(applications.filter((value) => value === frame)).toHaveLength(1);
				expect(red()).toBe(frame);
			}

			render(100);
			await waitFor(() => red() === 105);
			expect(ref.current!.getCurrentFrame()).toBe(5);
		} finally {
			root.unmount();
			container.remove();
		}
	},
);
