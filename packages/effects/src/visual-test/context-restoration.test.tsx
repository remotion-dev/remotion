import {Player} from '@remotion/player';
import {flushSync} from 'react-dom';
import {createRoot} from 'react-dom/client';
import {Internals, Solid} from 'remotion';
import {expect, test, vi} from 'vitest';
import {noise} from '../noise.js';
import {descriptorsToMemoizedEffects} from './visual-utils.js';

const pixel = (canvas: HTMLCanvasElement) =>
	Array.from(canvas.getContext('2d')!.getImageData(16, 16, 1, 1).data);

const lose = async (gl: WebGL2RenderingContext) => {
	const lost = new Promise<void>((resolve) => {
		gl.canvas.addEventListener('webglcontextlost', () => resolve(), {
			once: true,
		});
	});
	const extension = gl.getExtension('WEBGL_lose_context')!;
	extension.loseContext();
	await lost;
	return extension;
};

// Context loss in an Electron preview must not require another edit after restoration.
test('a paused Solid paints its latest requested color after context restoration', async () => {
	const container = document.createElement('div');
	document.body.appendChild(container);
	const root = createRoot(container);
	let context: WebGL2RenderingContext | null = null;
	const descriptor = noise({amount: 0});
	const original = descriptor.definition;
	const effect = {
		...descriptor,
		definition: {
			...original,
			setup: (target: HTMLCanvasElement) => {
				context = target.getContext('webgl2');
				return original.setup(target);
			},
		},
	};
	const Composition = ({color}: {color: string}) => (
		<Solid width={32} height={32} color={color} effects={[effect]} />
	);
	const paint = (color: string) => {
		flushSync(() => {
			root.render(
				<Player
					acknowledgeRemotionLicense
					component={Composition}
					inputProps={{color}}
					compositionWidth={32}
					compositionHeight={32}
					fps={30}
					durationInFrames={30}
				/>,
			);
		});
	};

	try {
		paint('red');
		const output = container.querySelector('canvas')!;

		await vi.waitFor(() => expect(pixel(output)).toEqual([255, 0, 0, 255]));
		const extension = await lose(context!);
		paint('blue');
		// Let the asynchronous source resize reach the lost context, without advancing the Player.
		await new Promise(requestAnimationFrame);
		await new Promise(requestAnimationFrame);
		extension.restoreContext();
		await vi.waitFor(() => expect(pixel(output)).toEqual([0, 0, 255, 255]));
	} finally {
		root.unmount();
		container.remove();
	}
});

test.each(['superseded', 'disposed'] as const)(
	'a context recovery wait settles when its run is %s',
	async (cancellation) => {
		const state = Internals.createEffectChainState(32, 32);
		const source = document.createElement('canvas');
		const output = document.createElement('canvas');
		source.width = 32;
		source.height = 32;
		output.width = 32;
		output.height = 32;
		const effects = descriptorsToMemoizedEffects([noise({amount: 0})]);
		const render = (color: string) => {
			const ctx = source.getContext('2d')!;
			ctx.fillStyle = color;
			ctx.fillRect(0, 0, 32, 32);
			return Internals.runEffectChain({
				state,
				source,
				effects,
				output,
				width: 32,
				height: 32,
			});
		};

		try {
			expect(await render('red')).toBe(true);
			const canvas = state.pool.getCanvas('webgl2', 0);
			const gl = canvas.getContext('webgl2')!;
			const extension = await lose(gl);
			const pending = render('blue');
			if (cancellation === 'disposed') {
				Internals.cleanupEffectChainState(state);
				expect(await pending).toBe(false);
				expect(pixel(output)).toEqual([255, 0, 0, 255]);
				return;
			}

			const latest = render('lime');
			expect(await pending).toBe(false);
			// Restore from a later frame, after the context-lost event has finished.
			await new Promise(requestAnimationFrame);
			extension.restoreContext();
			expect(await latest).toBe(true);
			expect(pixel(output)).toEqual([0, 255, 0, 255]);
		} finally {
			Internals.cleanupEffectChainState(state);
		}
	},
);
