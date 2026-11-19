import {afterEach, beforeEach, expect, test} from 'bun:test';
import {act, cleanup, render} from '@testing-library/react';
import React from 'react';
import {CanvasImage} from '../canvas-image/index.js';
import type {DelayRenderScope} from '../delay-render.js';
import {continueRenderInternal, delayRenderInternal} from '../delay-render.js';
import {RemotionEnvironmentContext} from '../remotion-environment-context.js';
import {DelayRenderContextType} from '../use-delay-render.js';
import {WrapSequenceContext} from './wrap-sequence-context.js';

class Boundary extends React.Component<
	{
		readonly children: React.ReactNode;
		readonly onError: (error: Error) => void;
	},
	{failure: Error | null}
> {
	state: {failure: Error | null} = {failure: null};
	static getDerivedStateFromError(failure: Error) {
		return {failure};
	}

	componentDidCatch(error: Error) {
		this.props.onError(error);
	}

	render() {
		return this.state.failure ? (
			<div role="alert">{this.state.failure.message}</div>
		) : (
			this.props.children
		);
	}
}
const environment = {
	isRendering: true,
	isPlayer: false,
	isStudio: false,
	isReadOnlyStudio: false,
	isClientSideRendering: false,
};
const images: ControlledImage[] = [];
class ControlledImage {
	onload: (() => void) | null = null;
	onerror: (() => void) | null = null;
	crossOrigin: string | null = null;
	src = '';
	naturalWidth = 32;
	naturalHeight = 32;
	width = 32;
	height = 32;
	constructor() {
		images.push(this);
	}

	decode() {
		return Promise.resolve();
	}
}
let previousImage: PropertyDescriptor | null = null;
let previousContext: PropertyDescriptor | null = null;
const scopes: DelayRenderScope[] = [];
let draws = 0;
beforeEach(() => {
	images.length = 0;
	draws = 0;
	previousImage = Object.getOwnPropertyDescriptor(globalThis, 'Image') ?? null;
	previousContext =
		Object.getOwnPropertyDescriptor(
			HTMLCanvasElement.prototype,
			'getContext',
		) ?? null;
	Object.defineProperty(globalThis, 'Image', {
		configurable: true,
		writable: true,
		value: ControlledImage,
	});
	Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
		configurable: true,
		writable: true,
		value: function (this: HTMLCanvasElement) {
			return this.isConnected
				? {
						canvas: this,
						clearRect: () => undefined,
						drawImage: () => {
							draws++;
						},
					}
				: null;
		} as unknown as HTMLCanvasElement['getContext'],
	});
});
afterEach(() => {
	cleanup();
	if (previousImage) Object.defineProperty(globalThis, 'Image', previousImage);
	else Reflect.deleteProperty(globalThis, 'Image');
	if (previousContext)
		Object.defineProperty(
			HTMLCanvasElement.prototype,
			'getContext',
			previousContext,
		);
	else Reflect.deleteProperty(HTMLCanvasElement.prototype, 'getContext');
	for (const scope of scopes.splice(0))
		for (const item of Object.values(scope.remotion_delayRenderTimeouts))
			clearTimeout(item.timeout);
});
const setup = () => {
	const scope: DelayRenderScope = {
		remotion_renderReady: true,
		remotion_delayRenderHandles: [],
		remotion_delayRenderTimeouts: {},
		remotion_puppeteerTimeout: 30000,
		remotion_attempt: 1,
	};
	scopes.push(scope);
	const errors: Error[] = [];
	const scene = (
		<RemotionEnvironmentContext.Provider value={environment}>
			<DelayRenderContextType.Provider value={scope}>
				<WrapSequenceContext>
					<Boundary onError={(error) => errors.push(error)}>
						<CanvasImage
							src="data:image/png;base64,controlled"
							width={32}
							height={32}
						/>
					</Boundary>
				</WrapSequenceContext>
			</DelayRenderContextType.Provider>
		</RemotionEnvironmentContext.Provider>
	);
	return {scope, errors, scene};
};

const flush = async () => {
	await Promise.resolve();
	await new Promise<void>((resolveTick) => setTimeout(resolveTick, 0));
};

for (const siblingPresent of [false, true]) {
	test(`fatal CanvasImage context setup releases its own hold with sibling=${siblingPresent}`, async () => {
		const {scope, errors, scene} = setup();
		const sibling = siblingPresent
			? delayRenderInternal({
					scope,
					environment,
					label: 'independent sibling',
					options: {},
				})
			: null;
		const siblingTimeout =
			sibling === null ? null : scope.remotion_delayRenderTimeouts[sibling];
		const view = render(scene);
		const image = images.at(-1);
		expect(image?.onload).toBeTruthy();
		await act(async () => {
			image!.onload!();
			await flush();
		});
		expect(errors).toHaveLength(1);
		expect(errors[0].message).toBe(
			'Could not get 2D context for <CanvasImage> source canvas',
		);
		expect(scope.remotion_cancelledErrorObject).toBe(errors[0]);
		expect(scope.remotion_cancelledError).toBe(errors[0].stack);
		expect(view.getByRole('alert').textContent).toBe(errors[0].message);
		expect(draws).toBe(0);
		expect(scope.remotion_delayRenderHandles).toEqual(
			sibling === null ? [] : [sibling],
		);
		expect(scope.remotion_renderReady).toBe(false);
		if (sibling !== null) {
			expect(scope.remotion_delayRenderTimeouts[sibling]).toBe(siblingTimeout!);
			continueRenderInternal({
				scope,
				handle: sibling,
				environment,
				logLevel: 'error',
			});
		}

		expect(scope.remotion_delayRenderHandles).toEqual([]);
		expect(Object.keys(scope.remotion_delayRenderTimeouts)).toEqual([]);
		expect(scope.remotion_renderReady).toBe(false);
		view.unmount();
	});
}

test('unmounting a pending CanvasImage load releases its hold without creating a cancellation', async () => {
	const {scope, errors, scene} = setup();
	const view = render(scene);
	const image = images.at(-1)!;
	view.unmount();
	await act(flush);
	expect(errors).toEqual([]);
	expect(image.onload).toBeNull();
	expect(image.onerror).toBeNull();
	expect(scope.remotion_delayRenderHandles).toEqual([]);
	expect(Object.keys(scope.remotion_delayRenderTimeouts)).toEqual([]);
	expect(scope.remotion_cancelledError).toBeUndefined();
	expect(scope.remotion_renderReady).toBe(true);
	expect(draws).toBe(0);
});
