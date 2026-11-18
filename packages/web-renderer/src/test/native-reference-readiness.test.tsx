import type {ComponentType} from 'react';
import {useContext, useEffect, useLayoutEffect, useState} from 'react';
import type {DelayRenderScope} from 'remotion';
import {continueRender, delayRender, Internals, useDelayRender} from 'remotion';
import {expect, test, vi} from 'vitest';
import {page} from 'vitest/browser';
import {captureNativeReference} from './native-reference';

const deferred = () => {
	let resolve!: () => void;
	const promise = new Promise<void>((done) => {
		resolve = done;
	});
	return {promise, resolve};
};

const nextFrame = () =>
	new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
const fixture = (component: ComponentType, id: string) => ({
	component,
	id,
	width: 32,
	height: 24,
	fps: 30,
	durationInFrames: 1,
});
const interceptScreenshot = (beforeScreenshot: () => void) => {
	const canvas = document.createElement('canvas');
	canvas.width = 32;
	canvas.height = 24;
	const png = canvas.toDataURL().split(',')[1];
	const screenshot = vi.fn(() => {
		beforeScreenshot();
		return Promise.resolve(png);
	});
	const locator = vi
		.spyOn(page, 'getByTestId')
		.mockReturnValue({screenshot} as unknown as ReturnType<
			typeof page.getByTestId
		>);
	return {screenshot, restore: () => locator.mockRestore()};
};

test('waits for a delayed fixture to commit before taking its native screenshot', async () => {
	const mounted = deferred();
	const release = deferred();
	let committed = false;
	let disposed = false;
	const Component = () => {
		const {delayRender: delay, continueRender: resume} = useDelayRender();
		const [handle] = useState(() => delay('Controlled native reference'));
		const [ready, setReady] = useState(false);
		useEffect(() => {
			let active = true;
			mounted.resolve();
			release.promise.then(() => {
				if (active) setReady(true);
			});
			return () => {
				active = false;
				disposed = true;
				resume(handle);
			};
		}, [handle, resume]);
		useLayoutEffect(() => {
			if (ready) {
				committed = true;
				resume(handle);
			}
		}, [ready, handle, resume]);
		return ready ? (
			<svg width={32} height={24}>
				<rect width={32} height={24} fill="red" />
			</svg>
		) : null;
	};

	const intercepted = interceptScreenshot(() => expect(committed).toBe(true));
	const outcome = captureNativeReference(
		fixture(Component, 'native-deferred'),
	).then(
		(value) => ({value, error: null}),
		(error: unknown) => ({value: null, error}),
	);
	try {
		await mounted.promise;
		await nextFrame();
		await nextFrame();
		expect(intercepted.screenshot).not.toHaveBeenCalled();
		expect(committed).toBe(false);
		release.resolve();
		const result = await outcome;
		expect(result.error).toBeNull();
		expect(result.value).toBeInstanceOf(Blob);
		expect(intercepted.screenshot).toHaveBeenCalledTimes(1);
		expect(disposed).toBe(true);
		expect(
			document.querySelector('[data-testid="native-deferred-native-0"]'),
		).toBeNull();
	} finally {
		release.resolve();
		await outcome;
		intercepted.restore();
	}
});

test('does not wait for unrelated global delayRender handles', async () => {
	const unrelated = delayRender('Unrelated global reference work');
	const intercepted = interceptScreenshot(() => {});
	try {
		await captureNativeReference(fixture(() => <div />, 'native-independent'));
		expect(intercepted.screenshot).toHaveBeenCalledTimes(1);
		expect(window.remotion_delayRenderHandles).toContain(unrelated);
	} finally {
		continueRender(unrelated);
		intercepted.restore();
	}
});

test('propagates the original scoped cancellation and cleans up the capture', async () => {
	const mounted = deferred();
	const cancel = deferred();
	const previousCancellation = {
		error: window.remotion_cancelledError,
		object: window.remotion_cancelledErrorObject,
	};
	const failure = new Error('Controlled native reference cancellation', {
		cause: new Error('Original cause'),
	});
	let capturedScope: DelayRenderScope | null = null;
	let disposed = false;
	const Component = () => {
		capturedScope = useContext(Internals.DelayRenderContextType);
		const {
			delayRender: delay,
			continueRender: resume,
			cancelRender,
		} = useDelayRender();
		const [handle] = useState(() => delay('Cancelled native reference'));
		useEffect(() => {
			let active = true;
			mounted.resolve();
			cancel.promise.then(() => {
				if (active) {
					try {
						cancelRender(failure);
					} catch {
						/* The scope retains the original error for the capture boundary. */
					}
				}
			});
			return () => {
				active = false;
				disposed = true;
				resume(handle);
			};
		}, [cancelRender, handle, resume]);
		return null;
	};

	const intercepted = interceptScreenshot(() => {
		throw new Error('Cancelled reference must not be photographed');
	});
	const outcome = captureNativeReference(
		fixture(Component, 'native-cancelled'),
	).catch((error: unknown) => error);
	try {
		await mounted.promise;
		cancel.resolve();
		expect(await outcome).toBe(failure);
		expect(intercepted.screenshot).not.toHaveBeenCalled();
		expect(disposed).toBe(true);
		expect(capturedScope).not.toBeNull();
		expect(capturedScope!.remotion_delayRenderHandles).toEqual([]);
		expect(
			document.querySelector('[data-testid="native-cancelled-native-0"]'),
		).toBeNull();
	} finally {
		cancel.resolve();
		await outcome;
		if (window.remotion_cancelledErrorObject === failure) {
			window.remotion_cancelledError = previousCancellation.error;
			window.remotion_cancelledErrorObject = previousCancellation.object;
		}

		intercepted.restore();
	}
});

test('times out pending scoped work without taking a screenshot or leaking handles', async () => {
	const mounted = deferred();
	let capturedScope: DelayRenderScope | null = null;
	let disposed = false;
	let ownedHandle: number | null = null;
	const actualNow = performance.now.bind(performance);
	let clockOffset = 0;
	const clock = vi
		.spyOn(performance, 'now')
		.mockImplementation(() => actualNow() + clockOffset);
	const Component = () => {
		capturedScope = useContext(Internals.DelayRenderContextType);
		const {delayRender: delay} = useDelayRender();
		useState(() => {
			ownedHandle = delay('Unreleased native reference');
			return ownedHandle;
		});
		useEffect(() => {
			mounted.resolve();
			return () => {
				disposed = true;
			};
		}, []);
		return null;
	};

	const intercepted = interceptScreenshot(() => {
		throw new Error('Pending reference must not be photographed');
	});
	const outcome = captureNativeReference(
		fixture(Component, 'native-timeout'),
	).catch((error: unknown) => error);
	try {
		await mounted.promise;
		await nextFrame();
		await nextFrame();
		clockOffset = 10001;
		const error = await outcome;
		expect(error).toBeInstanceOf(Error);
		expect((error as Error).message).toContain('Native reference remained');
		expect(intercepted.screenshot).not.toHaveBeenCalled();
		expect(disposed).toBe(true);
		expect(capturedScope).not.toBeNull();
		expect(capturedScope!.remotion_delayRenderHandles).toEqual([]);
		expect(capturedScope!.remotion_delayRenderTimeouts).toEqual({});
		expect(
			document.querySelector('[data-testid="native-timeout-native-0"]'),
		).toBeNull();
	} finally {
		await outcome;
		// The old harness used global handles; release only the handle owned by this test.
		if (!capturedScope && ownedHandle !== null) continueRender(ownedHandle);
		intercepted.restore();
		clock.mockRestore();
	}
});
