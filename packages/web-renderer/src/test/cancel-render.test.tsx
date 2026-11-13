import {useContext, useEffect, useLayoutEffect, useState} from 'react';
import {
	CanvasImage,
	Internals,
	useDelayRender,
	type DelayRenderScope,
} from 'remotion';
import {expect, test} from 'vitest';
import {renderMediaOnWeb} from '../render-media-on-web';
import {
	onlyOneMediaRenderAtATimeQueue,
	onlyOneStillRenderAtATimeQueue,
} from '../render-operations-queue';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {observeFinalCancelledRelease} from './observe-final-cancelled-release';

test('preserves the original cancellation error and its causes', async () => {
	const decoderError = new DOMException(
		'Decoder allocation failed',
		'EncodingError',
	);
	const mediaError = new Error('Video decoding failed at 0.5s', {
		cause: decoderError,
	});
	const error = new Error('This should be the error message', {
		cause: mediaError,
	});
	const Component: React.FC = () => {
		const {delayRender, cancelRender} = useDelayRender();

		useState(() => delayRender('Fetching data...'));

		useEffect(() => {
			Promise.resolve().then(() => {
				try {
					cancelRender(error);
				} catch {
					// cancelRender throws, we catch it here
				}
			});
		}, [cancelRender]);

		return null;
	};

	const composition = {
		component: Component,
		id: 'cancel-render-test',
		width: 100,
		height: 100,
		fps: 30,
		durationInFrames: 30,
	};

	await expect(
		renderStillOnWeb({
			licenseKey: 'free-license',
			composition,
			frame: 20,
			inputProps: {},
		}),
	).rejects.toBe(error);

	await expect(onlyOneStillRenderAtATimeQueue.ref).resolves.toBeUndefined();

	await expect(
		renderMediaOnWeb({
			licenseKey: 'free-license',
			composition,
			inputProps: {},
			container: 'webm',
		}),
	).rejects.toBe(error);

	await expect(onlyOneMediaRenderAtATimeQueue.ref).resolves.toBeUndefined();
});

for (const releaseHold of [false, true]) {
	for (const api of ['still', 'media'] as const) {
		test(`stored cancellation rejects public ${api} rendering after releasing hold=${releaseHold}`, async () => {
			const failure = new Error('Cancelled before renderer readiness', {
				cause: new Error('Original cancellation cause'),
			});
			const Component = () => {
				const {delayRender, continueRender, cancelRender} = useDelayRender();
				const [handle] = useState(() =>
					releaseHold ? delayRender('Own cleanup hold') : null,
				);
				useLayoutEffect(() => {
					try {
						cancelRender(failure);
					} catch (error) {
						if (error !== failure) throw error;
					} finally {
						if (handle !== null) continueRender(handle);
					}
				}, [cancelRender, continueRender, handle]);
				return null;
			};

			const composition = {
				component: Component,
				id: 'cancel-before-ready',
				width: 16,
				height: 16,
				fps: 30,
				durationInFrames: 1,
			};
			if (api === 'still') {
				await expect(
					renderStillOnWeb({
						licenseKey: 'free-license',
						composition,
						frame: 0,
						inputProps: {},
					}),
				).rejects.toBe(failure);
				await expect(
					onlyOneStillRenderAtATimeQueue.ref,
				).resolves.toBeUndefined();
			} else {
				await expect(
					renderMediaOnWeb({
						licenseKey: 'free-license',
						composition,
						inputProps: {},
						container: 'webm',
					}),
				).rejects.toBe(failure);
				await expect(
					onlyOneMediaRenderAtATimeQueue.ref,
				).resolves.toBeUndefined();
			}
		});
	}
}

test('a completed public capture stays complete when its retained cancellation callback is called later', async () => {
	let cancel: ReturnType<typeof useDelayRender>['cancelRender'] | null = null;
	const Component = () => {
		const {cancelRender} = useDelayRender();
		useLayoutEffect(() => {
			cancel = cancelRender;
		}, [cancelRender]);
		return <div style={{width: 16, height: 16, backgroundColor: '#00ff00'}} />;
	};

	const pending = renderStillOnWeb({
		licenseKey: 'free-license',
		composition: {
			component: Component,
			id: 'completed-before-cancel',
			width: 16,
			height: 16,
			fps: 30,
			durationInFrames: 1,
		},
		frame: 0,
		inputProps: {},
	});
	const result = await pending;
	const canvas = await result.canvas();
	const context = canvas.getContext('2d');
	if (!context || !cancel)
		throw new Error('Completed capture did not retain its pixels and callback');
	const pixels = Array.from(context.getImageData(0, 0, 16, 16).data);
	expect(pixels).toEqual(
		Array.from({length: 16 * 16}, () => [0, 255, 0, 255]).flat(),
	);
	const failure = new Error('Later cancellation');
	expect(() =>
		(cancel as ReturnType<typeof useDelayRender>['cancelRender'])(failure),
	).toThrow(failure);
	await expect(pending).resolves.toBe(result);
	expect(Array.from(context.getImageData(0, 0, 16, 16).data)).toEqual(pixels);
});

test('a fatal CanvasImage context failure releases its own hold and remains cancelled', async () => {
	const original = HTMLCanvasElement.prototype.getContext;
	const probe: {
		scope: DelayRenderScope | null;
		failedCanvas: HTMLCanvasElement | null;
		releasedError: Error | null;
		stackAtRelease: string | null;
	} = {
		scope: null,
		failedCanvas: null,
		releasedError: null,
		stackAtRelease: null,
	};
	const source =
		'data:image/svg+xml,' +
		encodeURIComponent(
			'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="16" height="16" fill="red"/></svg>',
		);
	function getContext(
		this: HTMLCanvasElement,
		kind: string,
		settings: unknown,
	) {
		if (
			kind === '2d' &&
			!this.isConnected &&
			(settings as CanvasRenderingContext2DSettings | null | undefined)
				?.colorSpace === 'srgb'
		) {
			probe.failedCanvas = this;
			HTMLCanvasElement.prototype.getContext = original;
			return null;
		}

		return (
			original as (
				this: HTMLCanvasElement,
				kind: string,
				settings: unknown,
			) => RenderingContext | null
		).call(this, kind, settings);
	}

	const Component = () => {
		const scope = useContext(Internals.DelayRenderContextType);
		useLayoutEffect(() => {
			if (!scope) {
				throw new Error('Fatal CanvasImage probe requires a render scope');
			}

			probe.scope = scope;
			const restore = observeFinalCancelledRelease(scope, (error, rawStack) => {
				probe.releasedError = error;
				probe.stackAtRelease = rawStack.startsWith('Error:')
					? rawStack
					: `${error.message}\n${rawStack}`;
			});
			HTMLCanvasElement.prototype.getContext = getContext as typeof original;
			return () => {
				HTMLCanvasElement.prototype.getContext = original;
				restore();
			};
		}, [scope]);
		return <CanvasImage src={source} width={16} height={16} />;
	};

	try {
		let failure: unknown = null;
		try {
			await renderStillOnWeb({
				licenseKey: 'free-license',
				composition: {
					component: Component,
					id: 'fatal-context-hold',
					width: 16,
					height: 16,
					fps: 30,
					durationInFrames: 1,
				},
				frame: 0,
				inputProps: {},
			});
		} catch (error) {
			failure = error;
		}

		expect(failure).toBeInstanceOf(Error);
		expect((failure as Error).message).toBe(
			'Could not get 2D context for <CanvasImage> source canvas',
		);
		expect(probe.failedCanvas).not.toBeNull();
		if (!probe.scope)
			throw new Error('The actual render scope was not observed');
		expect(probe.scope.remotion_cancelledErrorObject).toBe(failure);
		expect(probe.releasedError).toBe(failure);
		expect(probe.stackAtRelease).not.toBeNull();
		expect(probe.scope.remotion_cancelledError).toBe(probe.stackAtRelease);
		expect(probe.scope.remotion_delayRenderHandles).toEqual([]);
		expect(Object.keys(probe.scope.remotion_delayRenderTimeouts)).toEqual([]);
		expect(probe.scope.remotion_renderReady).toBe(false);
	} finally {
		HTMLCanvasElement.prototype.getContext = original;
		for (const entry of Object.values(
			probe.scope?.remotion_delayRenderTimeouts ?? {},
		))
			clearTimeout(entry.timeout);
	}
});
