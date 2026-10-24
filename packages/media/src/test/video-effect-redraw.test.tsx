import {Player, type PlayerRef} from '@remotion/player';
import React from 'react';
import {flushSync} from 'react-dom';
import {createRoot} from 'react-dom/client';
import {createEffect, useCurrentFrame} from 'remotion';
import {expect, test} from 'vitest';
import {Video} from '../video/video';
import {findLargestCanvas, waitFor} from './player-frame-accuracy-utils';

test.each([false, true])(
	'coalesces frame/effect updates and preserves paused edits and resizing (one-frame loop: %s)',
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
				ctx.fillStyle = `rgb(${params.frame + params.tint}, ${width - 160}, 0)`;
				ctx.fillRect(0, 0, width, height);
			},
		});
		const Composition = ({
			tint,
			effectFrame,
		}: {
			readonly tint: number;
			readonly effectFrame: number | null;
		}) => {
			const frame = useCurrentFrame();
			return (
				<Video
					src="/bigbuckbunny.mp4"
					muted
					trimAfter={singleFrameLoop ? 1 : undefined}
					loop={singleFrameLoop}
					effects={[effect({frame: effectFrame ?? frame, tint})]}
					effectsOutputSize={
						effectFrame === null ? null : {width: 160 + frame * 16, height: 90}
					}
				/>
			);
		};

		const container = document.createElement('div');
		document.body.appendChild(container);
		const root = createRoot(container);
		const ref = React.createRef<PlayerRef>();
		const render = (tint: number, effectFrame: number | null = null) =>
			flushSync(() =>
				root.render(
					<Player
						ref={ref}
						component={Composition}
						inputProps={{tint, effectFrame}}
						compositionWidth={320}
						compositionHeight={180}
						durationInFrames={300}
						fps={30}
						initiallyMuted
						numberOfSharedAudioTags={0}
					/>,
				),
			);
		const pixel = () =>
			findLargestCanvas(container).getContext('2d')!.getImageData(0, 0, 1, 1)
				.data;
		try {
			render(0);
			await waitFor(() => applications.length > 0);
			for (let frame = 1; frame <= 5; frame++) {
				flushSync(() => ref.current!.seekTo(frame));
				await waitFor(() => applications.includes(frame));
				await new Promise((resolve) => setTimeout(resolve, 30));
				expect(applications.filter((value) => value === frame)).toHaveLength(1);
				expect(pixel()[0]).toBe(frame);
			}

			render(100);
			await waitFor(() => pixel()[0] === 105);
			expect(ref.current!.getCurrentFrame()).toBe(5);

			// Keep effect parameters fixed while the next frame changes only the
			// effect resolution, including when the media timestamp stays at zero.
			render(100, 5);
			await waitFor(() => pixel()[1] === 80);
			const applicationsBeforeResize = applications.length;
			flushSync(() => ref.current!.seekTo(6));
			await waitFor(() => pixel()[1] === 96);
			expect(pixel()[0]).toBe(105);
			expect(applications).toHaveLength(applicationsBeforeResize + 1);
		} finally {
			root.unmount();
			container.remove();
		}
	},
);
