import {afterEach, expect, mock, test} from 'bun:test';
import {act, cleanup, render} from '@testing-library/react';
import React from 'react';
import type {AnimatedImageCanvasRef} from '../animated-image/canvas.js';
import {Canvas} from '../animated-image/canvas.js';
import type {
	EffectDefinition,
	EffectDefinitionAndStack,
} from '../effects/effect-types.js';

let previousGetContextDescriptor: PropertyDescriptor | undefined;

afterEach(() => {
	cleanup();
	if (previousGetContextDescriptor) {
		Object.defineProperty(
			HTMLCanvasElement.prototype,
			'getContext',
			previousGetContextDescriptor,
		);
		previousGetContextDescriptor = undefined;
	}
});

const installContextMock = () => {
	previousGetContextDescriptor = Object.getOwnPropertyDescriptor(
		HTMLCanvasElement.prototype,
		'getContext',
	);
	Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
		configurable: true,
		value(this: HTMLCanvasElement, kind: string) {
			if (kind !== '2d') {
				return null;
			}

			return {
				canvas: this,
				clearRect: () => undefined,
				drawImage: () => undefined,
			} as unknown as CanvasRenderingContext2D;
		},
	});
};

const makeEffect = (apply: () => void): EffectDefinitionAndStack<unknown>[] => {
	const definition: EffectDefinition<unknown, unknown> = {
		type: 'counting',
		label: 'counting',
		documentationLink: null,
		backend: '2d',
		calculateKey: () => 'counting',
		setup: () => null,
		apply,
		cleanup: () => undefined,
		schema: {},
		validateParams: () => {},
	};

	return [{definition, params: {}, effectKey: 'counting', memoized: true}];
};

// #12702: a GIF frame held for longer than one composition frame used to run
// the effect chain again for every composition frame.
test('AnimatedImage does not rerun effects for an unchanged decoded frame', async () => {
	installContextMock();

	const apply = mock(() => undefined);
	const effects = makeEffect(apply);
	const ref = React.createRef<AnimatedImageCanvasRef>();
	render(
		<Canvas ref={ref} fit="fill" effects={effects} effectsOutputSize={null} />,
	);

	const firstFrame = {displayWidth: 2, displayHeight: 1} as VideoFrame;
	const secondFrame = {displayWidth: 2, displayHeight: 1} as VideoFrame;

	await act(async () => {
		expect(await ref.current?.draw(firstFrame)).toBe(true);
	});
	expect(apply).toHaveBeenCalledTimes(1);

	// Same decoded frame, same inputs: nothing to redo
	await act(async () => {
		expect(await ref.current?.draw(firstFrame)).toBe(true);
	});
	expect(apply).toHaveBeenCalledTimes(1);

	// A different decoded frame has to go through the chain
	await act(async () => {
		expect(await ref.current?.draw(secondFrame)).toBe(true);
	});
	expect(apply).toHaveBeenCalledTimes(2);

	// Clearing the canvas invalidates what it shows
	await act(async () => {
		ref.current?.clear();
		expect(await ref.current?.draw(secondFrame)).toBe(true);
	});
	expect(apply).toHaveBeenCalledTimes(3);
});

test('AnimatedImage redraws a frame whose run was superseded', async () => {
	installContextMock();
	const originalBitmap = globalThis.createImageBitmap;
	const resizes: ((bitmap: ImageBitmap) => void)[] = [];
	globalThis.createImageBitmap = mock(
		() =>
			new Promise<ImageBitmap>((resolve) => {
				resizes.push(resolve);
			}),
	) as typeof createImageBitmap;

	try {
		const apply = mock(() => undefined);
		const effects = makeEffect(apply);
		const ref = React.createRef<AnimatedImageCanvasRef>();
		render(
			<Canvas
				ref={ref}
				fit="fill"
				effects={effects}
				effectsOutputSize={{width: 4, height: 2}}
			/>,
		);

		const firstFrame = {displayWidth: 2, displayHeight: 1} as VideoFrame;
		const secondFrame = {displayWidth: 2, displayHeight: 1} as VideoFrame;
		const bitmap = {close: () => undefined} as unknown as ImageBitmap;

		// The second draw starts while the first one waits for its resize
		await act(async () => {
			const first = ref.current!.draw(firstFrame);
			const second = ref.current!.draw(secondFrame);
			expect(resizes).toHaveLength(1);
			resizes[0](bitmap);
			expect(await first).toBe(false);
			resizes[1](bitmap);
			expect(await second).toBe(true);
		});
		expect(apply).toHaveBeenCalledTimes(1);

		// Nothing completed for the first frame, so it has to be drawn
		await act(async () => {
			const third = ref.current!.draw(firstFrame);
			resizes[2](bitmap);
			expect(await third).toBe(true);
		});
		expect(apply).toHaveBeenCalledTimes(2);

		// clear() while a draw is in flight: the finished draw must not be
		// remembered, because the canvas may have been cleared after it painted
		await act(async () => {
			const fourth = ref.current!.draw(secondFrame);
			ref.current!.clear();
			resizes[3](bitmap);
			expect(await fourth).toBe(true);
		});
		expect(apply).toHaveBeenCalledTimes(3);

		await act(async () => {
			const fifth = ref.current!.draw(secondFrame);
			resizes[4](bitmap);
			expect(await fifth).toBe(true);
		});
		expect(apply).toHaveBeenCalledTimes(4);

		// Same for a context restored while a draw is in flight
		const canvas = document.querySelector('canvas')!;
		await act(async () => {
			const sixth = ref.current!.draw(firstFrame);
			canvas.dispatchEvent(new Event('contextrestored'));
			resizes[5](bitmap);
			expect(await sixth).toBe(true);
		});
		expect(apply).toHaveBeenCalledTimes(5);

		await act(async () => {
			const seventh = ref.current!.draw(firstFrame);
			resizes[6](bitmap);
			expect(await seventh).toBe(true);
		});
		expect(apply).toHaveBeenCalledTimes(6);
	} finally {
		globalThis.createImageBitmap = originalBitmap;
	}
});

test('AnimatedImage redraws after a size change and a restored context', async () => {
	installContextMock();

	const apply = mock(() => undefined);
	const effects = makeEffect(apply);
	const ref = React.createRef<AnimatedImageCanvasRef>();
	const rendered = render(
		<Canvas ref={ref} fit="fill" effects={effects} effectsOutputSize={null} />,
	);
	const canvas = rendered.container.querySelector('canvas')!;
	const frame = {displayWidth: 2, displayHeight: 1} as VideoFrame;

	await act(async () => {
		expect(await ref.current?.draw(frame)).toBe(true);
	});
	expect(apply).toHaveBeenCalledTimes(1);

	// A different output size draws the same frame again
	rendered.rerender(
		<Canvas
			ref={ref}
			width={4}
			fit="fill"
			effects={effects}
			effectsOutputSize={null}
		/>,
	);
	await act(async () => {
		expect(await ref.current?.draw(frame)).toBe(true);
	});
	expect(apply).toHaveBeenCalledTimes(2);

	await act(async () => {
		expect(await ref.current?.draw(frame)).toBe(true);
	});
	expect(apply).toHaveBeenCalledTimes(2);

	// A restored 2D context comes back blank
	await act(async () => {
		canvas.dispatchEvent(new Event('contextrestored'));
		expect(await ref.current?.draw(frame)).toBe(true);
	});
	expect(apply).toHaveBeenCalledTimes(3);

	// A different height
	rendered.rerender(
		<Canvas
			ref={ref}
			width={4}
			height={3}
			fit="fill"
			effects={effects}
			effectsOutputSize={null}
		/>,
	);
	await act(async () => {
		expect(await ref.current?.draw(frame)).toBe(true);
	});
	expect(apply).toHaveBeenCalledTimes(4);

	// A new effect chain state, here through effectsOutputSize
	rendered.rerender(
		<Canvas
			ref={ref}
			width={4}
			height={3}
			fit="fill"
			effects={effects}
			effectsOutputSize={{width: 4, height: 3}}
		/>,
	);
	await act(async () => {
		expect(await ref.current?.draw(frame)).toBe(true);
	});
	expect(apply).toHaveBeenCalledTimes(5);

	await act(async () => {
		expect(await ref.current?.draw(frame)).toBe(true);
	});
	expect(apply).toHaveBeenCalledTimes(5);
});

test('AnimatedImage reruns effects when the effect parameters change', async () => {
	installContextMock();

	const apply = mock(() => undefined);
	const ref = React.createRef<AnimatedImageCanvasRef>();
	const rendered = render(
		<Canvas
			ref={ref}
			fit="fill"
			effects={makeEffect(apply)}
			effectsOutputSize={null}
		/>,
	);

	const frame = {displayWidth: 2, displayHeight: 1} as VideoFrame;

	await act(async () => {
		await ref.current?.draw(frame);
	});
	expect(apply).toHaveBeenCalledTimes(1);

	// `useMemoizedEffects` hands out a new array when any parameter changed
	const changedEffects = makeEffect(apply);
	rendered.rerender(
		<Canvas
			ref={ref}
			fit="fill"
			effects={changedEffects}
			effectsOutputSize={null}
		/>,
	);
	await act(async () => {
		await ref.current?.draw(frame);
	});
	expect(apply).toHaveBeenCalledTimes(2);

	// A different fit draws the same frame differently
	rendered.rerender(
		<Canvas
			ref={ref}
			fit="contain"
			effects={changedEffects}
			effectsOutputSize={null}
		/>,
	);
	await act(async () => {
		await ref.current?.draw(frame);
	});
	expect(apply).toHaveBeenCalledTimes(3);
});
