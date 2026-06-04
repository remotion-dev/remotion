import {afterEach, expect, test} from 'bun:test';
import {cleanup, render} from '@testing-library/react';
import {Solid} from '../effects/Solid.js';
import {WrapSequenceContext} from './wrap-sequence-context.js';

// happy-dom doesn't implement canvas; install a no-op stub so the chain
// runtime can execute without throwing on `getContext('2d')`.
const stub2dContext = () => ({
	canvas: null as unknown as HTMLCanvasElement,
	fillStyle: '',
	fillRect: () => undefined,
	clearRect: () => undefined,
	drawImage: () => undefined,
	reset: () => undefined,
	getImageData: () => ({
		data: new Uint8ClampedArray(4),
		width: 1,
		height: 1,
	}),
	putImageData: () => undefined,
});

(
	HTMLCanvasElement.prototype as unknown as {
		getContext: (kind: string) => unknown;
	}
).getContext = function (kind: string) {
	if (kind === '2d') {
		const ctx = stub2dContext();
		ctx.canvas = this as HTMLCanvasElement;
		return ctx;
	}

	return null;
};

afterEach(() => {
	cleanup();
});

test('<Solid> renders a canvas element with the given dimensions', () => {
	const {container} = render(
		<WrapSequenceContext>
			<Solid color="red" width={120} height={80} />
		</WrapSequenceContext>,
	);

	const canvas = container.querySelector('canvas');
	expect(canvas).not.toBeNull();
	expect(canvas?.getAttribute('width')).toBe('120');
	expect(canvas?.getAttribute('height')).toBe('80');
});

test('<Solid> forwards className and style', () => {
	const {container} = render(
		<WrapSequenceContext>
			<Solid
				color="blue"
				width={100}
				height={100}
				className="my-solid"
				style={{opacity: 0.5}}
			/>
		</WrapSequenceContext>,
	);

	const canvas = container.querySelector('canvas');
	expect(canvas?.className).toBe('my-solid');
	expect(canvas?.style.opacity).toBe('0.5');
});

test('<Solid> renders without a color', () => {
	const {container} = render(
		<WrapSequenceContext>
			<Solid width={64} height={64} />
		</WrapSequenceContext>,
	);

	expect(container.querySelector('canvas')).not.toBeNull();
});

test('<Solid> accepts an empty effects array', () => {
	const {container} = render(
		<WrapSequenceContext>
			<Solid color="green" width={64} height={64} effects={[]} />
		</WrapSequenceContext>,
	);

	expect(container.querySelector('canvas')).not.toBeNull();
});

test('<Solid> scales the backing canvas by pixelDensity while keeping logical CSS size', () => {
	const {container} = render(
		<WrapSequenceContext>
			<Solid color="red" width={120} height={80} pixelDensity={2} />
		</WrapSequenceContext>,
	);

	const canvas = container.querySelector('canvas');
	expect(canvas?.getAttribute('width')).toBe('240');
	expect(canvas?.getAttribute('height')).toBe('160');
	expect(canvas?.style.width).toBe('120px');
	expect(canvas?.style.height).toBe('80px');
});

test('<Solid> rounds up the backing canvas for fractional pixelDensity', () => {
	const {container} = render(
		<WrapSequenceContext>
			<Solid color="red" width={101} height={50} pixelDensity={1.5} />
		</WrapSequenceContext>,
	);

	const canvas = container.querySelector('canvas');
	expect(canvas?.getAttribute('width')).toBe('152');
	expect(canvas?.getAttribute('height')).toBe('75');
});

test('<Solid> throws for an invalid pixelDensity', () => {
	expect(() =>
		render(
			<WrapSequenceContext>
				<Solid color="red" width={120} height={80} pixelDensity={0} />
			</WrapSequenceContext>,
		),
	).toThrow(/`pixelDensity` must be a positive finite number/);
});
