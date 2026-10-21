import {Gif} from '@remotion/gif';
import {Audio, Video} from '@remotion/media';
import {Player} from '@remotion/player';
import React, {
	startTransition,
	Suspense,
	useLayoutEffect,
	useState,
} from 'react';
import {createRoot} from 'react-dom/client';
import {
	AnimatedImage,
	CanvasImage,
	Img,
	type MediaErrorHandler,
} from 'remotion';
import {expect, test, vi} from 'vitest';
import {server} from 'vitest/browser';
import {renderMediaOnWeb} from '../render-media-on-web';
import {renderStillOnWeb} from '../render-still-on-web';
import {withResolvers} from '../with-resolvers';
import '../symbol-dispose';

vi.mock('../send-telemetry-event', {spy: true});

const composition = (component: React.FC) => ({
	component,
	id: 'asset-recovery',
	width: 16,
	height: 16,
	fps: 30,
	durationInFrames: 1,
});

const assets = {
	image: (src: string, onError: MediaErrorHandler) => (
		<Img src={src} maxRetries={0} onImageError={onError} />
	),
	canvas: (src: string, onError: MediaErrorHandler) => (
		<CanvasImage src={src} maxRetries={0} onError={onError} />
	),
	animated: (src: string, onError: MediaErrorHandler) => (
		<AnimatedImage src={src} onError={onError} />
	),
	gif: (src: string, onError: MediaErrorHandler) => (
		<Gif src={src} onError={onError} />
	),
	video: (src: string, onError: MediaErrorHandler) => (
		<Video src={src} onError={onError} />
	),
	audio: (src: string, onError: MediaErrorHandler) => (
		<Audio src={src} onError={onError} />
	),
};

for (const kind of Object.keys(assets) as (keyof typeof assets)[]) {
	test(`${kind} awaits recovery and propagates the replacement Error intact`, async (context) => {
		if (
			typeof VideoEncoder === 'undefined' ||
			!(
				await VideoEncoder.isConfigSupported({
					codec: 'vp8',
					width: 16,
					height: 16,
				})
			).supported
		) {
			context.skip();
			return;
		}

		const src = URL.createObjectURL(
			new Blob(['invalid media'], {type: 'application/octet-stream'}),
		);
		const entered = withResolvers<void>();
		const decision = withResolvers<void>();
		const failure = Object.assign(
			new Error('The application could not recover this asset'),
			{assetId: 'asset-1'},
		);
		let calls = 0;
		let settled = false;
		const onError: MediaErrorHandler = async (cause) => {
			calls++;
			failure.cause = cause;
			entered.resolve();
			await decision.promise;
			throw failure;
		};

		const Component = () => assets[kind](src, onError);
		const controller = new AbortController();
		const rendering = renderMediaOnWeb({
			composition: composition(Component),
			inputProps: {},
			licenseKey: 'free-license',
			container: 'webm',
			videoCodec: 'vp8',
			outputTarget: 'arraybuffer',
			signal: controller.signal,
		});
		const outcome = rendering.then(
			() => {
				settled = true;
				return null;
			},
			(error) => {
				settled = true;
				return error;
			},
		);
		try {
			await entered.promise;
			await new Promise<void>((resolve) =>
				requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
			);
			expect(settled).toBe(false);
			decision.resolve();
			const error = await outcome;
			expect(error).toBe(failure);
			expect(error.assetId).toBe('asset-1');
			expect(error.cause).toBeInstanceOf(Error);
			expect(calls).toBe(1);
		} finally {
			controller.abort();
			decision.resolve();
			await outcome;
			URL.revokeObjectURL(src);
		}
	}, 20000);
}

test.each(['image', 'canvas'] as const)(
	'%s waits for a suspended recovery transition before rendering the replacement',
	async (kind) => {
		const src = URL.createObjectURL(new Blob(['invalid image']));
		const canvas = document.createElement('canvas');
		canvas.width = 16;
		canvas.height = 16;
		const ctx = canvas.getContext('2d')!;
		ctx.fillStyle = '#00ff00';
		ctx.fillRect(0, 0, 16, 16);
		const replacement = canvas.toDataURL();
		const entered = withResolvers<void>();
		const decision = withResolvers<void>();
		const transitioning = withResolvers<void>();
		const replacementReady = withResolvers<void>();
		let ready = false;
		let settled = false;
		const Component = () => {
			const [current, setCurrent] = useState(src);
			if (current === replacement && !ready) {
				transitioning.resolve();
				throw replacementReady.promise;
			}

			return assets[kind](current, async () => {
				entered.resolve();
				await decision.promise;
				startTransition(() => setCurrent(replacement));
				return 'handled' as const;
			});
		};

		const rendering = renderStillOnWeb({
			frame: 0,
			composition: composition(() => (
				<Suspense fallback={null}>
					<Component />
				</Suspense>
			)),
			inputProps: {},
			licenseKey: 'free-license',
		});
		const outcome = rendering.finally(() => {
			settled = true;
		});
		try {
			await entered.promise;
			expect(settled).toBe(false);
			decision.resolve();
			await transitioning.promise;
			await new Promise<void>((resolve) =>
				requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
			);
			expect(settled).toBe(false);
			ready = true;
			replacementReady.resolve();
			const result = await outcome;
			const bitmap = await createImageBitmap(await result.blob());
			ctx.drawImage(bitmap, 0, 0);
			bitmap.close();
			expect(Array.from(ctx.getImageData(8, 8, 1, 1).data)).toEqual([
				0, 255, 0, 255,
			]);
		} finally {
			ready = true;
			replacementReady.resolve();
			decision.resolve();
			URL.revokeObjectURL(src);
		}
	},
	20000,
);

test('ignores an async image rejection after its source has been replaced', async () => {
	const src = URL.createObjectURL(new Blob(['invalid image']));
	const entered = withResolvers<void>();
	const decision = withResolvers<void>();
	const replaced = withResolvers<void>();
	let replace = () => {};
	const Component = () => {
		const [show, setShow] = useState(true);
		replace = () => setShow(false);
		useLayoutEffect(() => {
			if (!show) replaced.resolve();
		}, [show]);
		return show ? (
			<Img
				src={src}
				maxRetries={0}
				onImageError={async () => {
					entered.resolve();
					await decision.promise;
					throw new Error('obsolete failure');
				}}
			/>
		) : (
			<div style={{width: 16, height: 16, background: 'green'}} />
		);
	};

	const rendering = renderStillOnWeb({
		frame: 0,
		composition: composition(Component),
		inputProps: {},
		licenseKey: 'free-license',
	});
	try {
		await entered.promise;
		replace();
		await replaced.promise;
		decision.resolve();
		expect((await (await rendering).blob()).size).toBeGreaterThan(0);
	} finally {
		decision.resolve();
		URL.revokeObjectURL(src);
	}
}, 20000);

for (const kind of Object.keys(assets) as (keyof typeof assets)[]) {
	test(`${kind} recovery does not prevent abort or cancel a later render`, async (context) => {
		if (
			typeof VideoEncoder === 'undefined' ||
			!(
				await VideoEncoder.isConfigSupported({
					codec: 'vp8',
					width: 16,
					height: 16,
				})
			).supported
		) {
			context.skip();
			return;
		}

		const src = URL.createObjectURL(new Blob(['invalid media']));
		const entered = withResolvers<void>();
		const decision = withResolvers<void>();
		const controller = new AbortController();
		const Component = () =>
			assets[kind](src, async () => {
				entered.resolve();
				await decision.promise;
				throw new Error('late failure after abort');
			});
		const rendering = renderMediaOnWeb({
			composition: composition(Component),
			inputProps: {},
			licenseKey: 'free-license',
			container: 'webm',
			videoCodec: 'vp8',
			outputTarget: 'arraybuffer',
			signal: controller.signal,
		});
		const outcome = rendering.catch((error) => error);
		try {
			await entered.promise;
			controller.abort();
			expect(await outcome).toBeInstanceOf(Error);
			expect((await outcome).message).toBe('renderMediaOnWeb() was cancelled');
			decision.resolve();
			await new Promise<void>((resolve) =>
				requestAnimationFrame(() => resolve()),
			);
			const result = await renderStillOnWeb({
				composition: composition(() => <div />),
				inputProps: {},
				licenseKey: 'free-license',
				frame: 0,
			});
			expect((await result.blob()).size).toBeGreaterThan(0);
		} finally {
			controller.abort();
			decision.resolve();
			await outcome;
			URL.revokeObjectURL(src);
		}
	}, 20000);
}

test('a legacy native image callback does not mark a broken image ready', async () => {
	const src = URL.createObjectURL(new Blob(['invalid image']));
	const entered = withResolvers<void>();
	const controller = new AbortController();
	let settled = false;
	const Component = () => (
		<Img
			src={src}
			maxRetries={0}
			onImageError={() => {
				entered.resolve();
			}}
		/>
	);
	const result = renderStillOnWeb({
		composition: composition(Component),
		inputProps: {},
		licenseKey: 'free-license',
		frame: 0,
		signal: controller.signal,
	});
	const outcome = result.then(
		() => {
			settled = true;
			return null;
		},
		(error) => {
			settled = true;
			return error;
		},
	);
	try {
		await entered.promise;
		await new Promise<void>((resolve) =>
			requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
		);
		expect(settled).toBe(false);
		controller.abort();
		expect((await outcome).message).toBe('renderStillOnWeb() was cancelled');
	} finally {
		controller.abort();
		await outcome;
		URL.revokeObjectURL(src);
	}
}, 10000);

// PR #12290 review: legacy logging callbacks may return incidental values.
// These callbacks must still release the default CanvasImage error hold.
test.each(['count', 'event-id', 'error', 'response'] as const)(
	'legacy image callback returning %s does not leave rendering pending',
	async (returned) => {
		const src = URL.createObjectURL(new Blob(['invalid image']));
		const errors: Error[] = [];
		const onError: MediaErrorHandler = (error) => {
			const count = errors.push(error);
			if (returned === 'count') return count;
			if (returned === 'event-id') return 'sentry-event-id';
			if (returned === 'error') return error;

			return Promise.resolve(new Response('logged'));
		};

		const controller = new AbortController();
		try {
			const result = await renderStillOnWeb({
				composition: composition(() => (
					<CanvasImage src={src} maxRetries={0} onError={onError} />
				)),
				inputProps: {},
				licenseKey: 'free-license',
				frame: 0,
				signal: controller.signal,
				delayRenderTimeoutInMilliseconds: 2500,
			});
			expect((await result.blob()).size).toBeGreaterThan(0);
			expect(errors).toHaveLength(1);
		} finally {
			controller.abort();
			URL.revokeObjectURL(src);
		}
	},
);

// PR #12290 review: retain source context for the original GIF failure,
// and preserve a handler's own replacement Error rather than wrapping it.
// WebKit's GIF worker does not deliver its parse failure in this harness.
test.skipIf(server.browser === 'webkit').each(['fail', 'reject'] as const)(
	'GIF preview %s keeps the appropriate error context',
	async (decision) => {
		const container = document.createElement('div');
		document.body.appendChild(container);
		const root = createRoot(container);
		const src = URL.createObjectURL(
			new Blob(['invalid GIF'], {type: 'text/plain'}),
		);
		const replacement = new Error('Application GIF recovery failed');
		let caught: Error | null = null;
		const Component = () => (
			<Gif
				src={src}
				onError={() =>
					decision === 'fail' ? 'fail' : Promise.reject(replacement)
				}
			/>
		);
		root.render(
			<Player
				acknowledgeRemotionLicense
				component={Component}
				durationInFrames={1}
				fps={30}
				compositionWidth={16}
				compositionHeight={16}
				inputProps={{}}
				errorFallback={({error}) => {
					caught = error;
					return null;
				}}
			/>,
		);
		try {
			await vi.waitFor(() => expect(caught).not.toBeNull(), {timeout: 5000});
			if (decision === 'reject') {
				expect(caught).toBe(replacement);
			} else {
				expect(caught).toHaveProperty('message', expect.stringContaining(src));
				expect(caught).toHaveProperty(
					'message',
					expect.stringContaining('Wrong content type'),
				);
			}
		} finally {
			root.unmount();
			container.remove();
			URL.revokeObjectURL(src);
		}
	},
	10000,
);
