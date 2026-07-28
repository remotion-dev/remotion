import {afterEach, expect, test} from 'bun:test';
import {act, cleanup, render} from '@testing-library/react';
import React from 'react';
import type {AnimatedImageCanvasRef} from '../animated-image/canvas.js';
import {Canvas} from '../animated-image/canvas.js';

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

test('AnimatedImage retains a frame drawn while its canvas is hidden', async () => {
	const pixels = new WeakMap<HTMLCanvasElement, string>();
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
				clearRect: () => pixels.delete(this),
				drawImage: (source: CanvasImageSource) => {
					if (source instanceof HTMLCanvasElement) {
						const pixel = pixels.get(source);
						if (pixel) {
							pixels.set(this, pixel);
						}

						return;
					}

					pixels.set(this, (source as unknown as {pixel: string}).pixel);
				},
			} as unknown as CanvasRenderingContext2D;
		},
	});

	const ref = React.createRef<AnimatedImageCanvasRef>();
	const rendered = render(
		<Canvas ref={ref} fit="fill" effects={[]} style={{display: 'none'}} />,
	);
	const canvas = rendered.container.querySelector('canvas');
	if (!canvas) {
		throw new Error('Expected a canvas');
	}

	const frame = {
		displayWidth: 2,
		displayHeight: 1,
		pixel: 'initial-frame',
	} as unknown as VideoFrame;

	await act(async () => {
		await ref.current?.draw(frame);
	});

	expect(canvas.style.display).toBe('none');
	expect(pixels.get(canvas)).toBe('initial-frame');

	rendered.rerender(
		<Canvas ref={ref} fit="fill" effects={[]} style={{display: 'block'}} />,
	);

	expect(rendered.container.querySelector('canvas')).toBe(canvas);
	expect(canvas.style.display).toBe('block');
	expect(pixels.get(canvas)).toBe('initial-frame');
});
