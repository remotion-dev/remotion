import {Player, type PlayerRef} from '@remotion/player';
import {createRef} from 'react';
import {createRoot} from 'react-dom/client';
import {
	CanvasImage,
	HtmlInCanvas,
	isHtmlInCanvasSupported,
	createEffect,
	Solid,
	Sequence,
	type EffectFrameTiming,
} from 'remotion';
import {expect, test, vi} from 'vitest';

for (const kind of ['solid', 'image', 'html'] as const) {
	test(`${kind} follows local time only while a temporal effect is enabled`, async (t) => {
		if (kind === 'html' && !isHtmlInCanvasSupported()) {
			t.skip();
			return;
		}

		const container = document.createElement('div');
		document.body.appendChild(container);
		const root = createRoot(container);
		const player = createRef<PlayerRef>();
		let received: EffectFrameTiming | undefined;
		let applications = 0;
		let setups = 0;
		const effect = createEffect<{animated: boolean}, null>({
			type: 'test.temporal',
			label: 'Temporal',
			documentationLink: null,
			backend: '2d',
			calculateKey: ({animated}) => String(animated),
			frameDependent: ({animated}) => animated,
			setup: () => {
				setups++;
				return null;
			},
			apply: ({frameTiming, target}) => {
				received = frameTiming;
				applications++;
				const context = target.getContext('2d')!;
				context.fillStyle = `rgb(${Math.round((frameTiming?.timestampInSeconds ?? 0) * 100)}, 0, 0)`;
				context.fillRect(0, 0, target.width, target.height);
			},
			cleanup: () => {},
			schema: {},
			validateParams: () => {},
		});
		const Composition = ({
			animated,
			disabled,
		}: {
			readonly animated: boolean;
			readonly disabled: boolean;
		}) => {
			const props = {
				width: 8,
				height: 8,
				effects: [effect({animated, disabled})],
			};
			return (
				<Sequence from={5} playbackRate={2} durationInFrames={30} layout="none">
					{kind === 'solid' ? (
						<Solid {...props} color="black" />
					) : kind === 'html' ? (
						<HtmlInCanvas {...props}>
							<div style={{width: 8, height: 8, background: 'black'}} />
						</HtmlInCanvas>
					) : (
						<CanvasImage
							{...props}
							src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8'/%3E"
						/>
					)}
				</Sequence>
			);
		};

		const mount = (animated: boolean, disabled = false) =>
			root.render(
				<Player
					ref={player}
					acknowledgeRemotionLicense
					component={Composition}
					inputProps={{animated, disabled}}
					compositionWidth={8}
					compositionHeight={8}
					durationInFrames={60}
					fps={30}
					style={{width: 80}}
				/>,
			);
		const pixel = () =>
			container
				.querySelector('canvas')!
				.getContext('2d')!
				.getImageData(0, 0, 1, 1).data[0];
		try {
			mount(true);
			await vi.waitFor(() => expect(player.current).not.toBeNull());
			player.current!.seekTo(8);
			await vi.waitFor(() => {
				expect(received?.timestampInSeconds).toBeCloseTo(0.2);
				expect(pixel()).toBe(20);
			});
			const canvas = container.querySelector('canvas');
			const initialSetups = setups;
			player.current!.seekTo(9);
			await vi.waitFor(() => expect(pixel()).toBe(27));
			expect(setups).toBe(initialSetups);
			expect(container.querySelector('canvas')).toBe(canvas);

			mount(false);
			await vi.waitFor(() => expect(pixel()).toBe(0));
			const staticApplications = applications;
			player.current!.seekTo(10);
			await new Promise(requestAnimationFrame);
			await new Promise(requestAnimationFrame);
			expect(applications).toBe(staticApplications);

			mount(true);
			await vi.waitFor(() => expect(pixel()).toBe(33));
			expect(container.querySelector('canvas')).toBe(canvas);
			expect(setups).toBe(initialSetups);
			mount(true, true);
			await vi.waitFor(() => expect(pixel()).toBe(0));
			const disabledApplications = applications;
			player.current!.seekTo(11);
			await new Promise(requestAnimationFrame);
			await new Promise(requestAnimationFrame);
			expect(applications).toBe(disabledApplications);
		} finally {
			root.unmount();
			container.remove();
		}
	});
}
