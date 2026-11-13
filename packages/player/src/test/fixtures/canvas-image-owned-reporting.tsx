import {mock} from 'bun:test';
import {resolve} from 'node:path';
import type {PlayerRef} from '../../player-methods.js';

const main = async () => {
	const mode = process.argv[2];
	const images: ControlledImage[] = [];
	class ControlledImage {
		onload: (() => void) | null = null;
		onerror: (() => void) | null = null;
		crossOrigin: string | null = null;
		naturalWidth = 32;
		naturalHeight = 32;
		width = 32;
		height = 32;
		src = '';
		constructor() {
			images.push(this);
		}
		decode() {
			return Promise.resolve();
		}
	}
	const originalImage = globalThis.Image;
	globalThis.Image = ControlledImage as unknown as typeof Image;
	const core = require(
		resolve(__dirname, '../../../../core/dist/cjs/index.js'),
	);
	mock.module('remotion', () => core);
	const {CanvasImage} = await import('remotion');
	const {Player} = await import('../../Player.js');
	const {render, act, cleanup} = await import('@testing-library/react');
	const {flushSync} = await import('react-dom');
	const pixels = new WeakMap<object, string>();
	const originalContext = HTMLCanvasElement.prototype.getContext;
	HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement) {
		const canvas = this;
		if (mode === 'sync-context' && !canvas.isConnected) return null;
		return {
			canvas,
			clearRect: () => pixels.delete(canvas),
			drawImage: (source: object) => {
				const value =
					source instanceof ControlledImage ? source.src : pixels.get(source);
				if (value) pixels.set(canvas, value);
			},
			fillRect: () => undefined,
		};
	} as unknown as typeof originalContext;
	const errors: Error[] = [];
	const userErrors: Error[] = [];
	const firstSrc = 'data:image/png;base64,first';
	const nextSrc = 'data:image/png;base64,replacement';
	const failureMessage = `Could not load <CanvasImage> with src="${firstSrc}"`;
	const authoredError = new Error('authored CanvasImage onError throw');
	const onError = (error: Error) => {
		userErrors.push(error);
		if (mode === 'user-throw') {
			process.stdout.write(
				JSON.stringify({
					mode,
					originalUserMessage: error.message === failureMessage,
				}) + '\n',
			);
			throw authoredError;
		}
	};
	const Content = ({src}: {readonly src: string}) => (
		<CanvasImage
			src={src}
			width={32}
			height={32}
			maxRetries={0}
			onError={
				mode === 'user' || mode === 'user-throw' || mode === 'stale-user'
					? onError
					: undefined
			}
		/>
	);
	const config = {
		compositionWidth: 32,
		compositionHeight: 32,
		durationInFrames: 30,
		fps: 30,
		acknowledgeRemotionLicense: true,
	};
	const listen = (ref: PlayerRef | null) =>
		ref?.addEventListener('error', (event) => errors.push(event.detail.error));
	const fallback = ({error}: {readonly error: Error}) => (
		<div role="alert">{error.message}</div>
	);
	const scene = (src: string) => (
		<Player
			{...config}
			component={Content}
			ref={listen}
			inputProps={{src}}
			errorFallback={fallback}
		/>
	);
	const flush = async () => {
		await Promise.resolve();
		await new Promise<void>((resolveTick) => setTimeout(resolveTick, 0));
	};
	try {
		const view = render(scene(firstSrc));
		await act(flush);
		const old = images.at(-1);
		if (!old?.onerror)
			throw new Error('Actual CanvasImage did not create its image loader');
		if (mode === 'abort') {
			view.unmount();
			await act(flush);
			if (
				old.onerror !== null ||
				old.onload !== null ||
				errors.length ||
				userErrors.length
			)
				throw new Error('Aborted load did not release its callbacks');
		} else if (mode === 'stale' || mode === 'stale-user') {
			// Reject the old load before cleanup, but let its Promise catch run only after replacement commits.
			old.onerror();
			flushSync(() => view.rerender(scene(nextSrc)));
			const current = images.at(-1);
			if (!current || current === old || !current.onload)
				throw new Error('Replacement image load did not start');
			await act(async () => {
				current.onload!();
				await flush();
				await flush();
			});
			const canvas = view.container.querySelector('canvas');
			if (
				errors.length ||
				userErrors.length ||
				view.queryByRole('alert') ||
				!canvas ||
				pixels.get(canvas) !== nextSrc
			)
				throw new Error(
					'Retired rejection changed its healthy replacement or user callback',
				);
			view.unmount();
		} else if (mode === 'sync-context') {
			await act(async () => {
				old.onload!();
				await flush();
			});
			if (
				errors.length !== 1 ||
				errors[0].message !==
					'Could not get 2D context for <CanvasImage> source canvas' ||
				view.getByRole('alert').textContent !== errors[0].message
			)
				throw new Error(
					'Synchronous no-context cancellation stopped throwing into its boundary',
				);
			view.unmount();
		} else {
			await act(async () => {
				old.onerror!();
				await flush();
			});
			if (mode === 'active') {
				if (
					errors.length !== 1 ||
					errors[0].message !== failureMessage ||
					view.getByRole('alert').textContent !== failureMessage
				)
					throw new Error('Owned load failure did not reach fallback once');
			} else if (mode === 'user') {
				if (
					errors.length ||
					userErrors.length !== 1 ||
					userErrors[0].message !== failureMessage ||
					view.queryByRole('alert')
				)
					throw new Error('User load error policy changed');
			} else if (mode !== 'user-throw')
				throw new Error('Unknown CanvasImage mode');
			view.unmount();
		}
		if (
			(window.remotion_delayRenderHandles ?? []).length !== 0 ||
			window.remotion_cancelledErrorObject !== undefined
		)
			throw new Error(
				'CanvasImage cancellation leaked readiness or poisoned renderer state',
			);
		process.stdout.write(
			JSON.stringify({
				mode,
				ownedErrors: errors.length,
				userErrors: userErrors.length,
				allNativeCallbacksCleared: images.every(
					(image) => image.onerror === null && image.onload === null,
				),
			}) + '\n',
		);
	} finally {
		cleanup();
		globalThis.Image = originalImage;
		HTMLCanvasElement.prototype.getContext = originalContext;
		mock.restore();
	}
};
main().catch((error: unknown) => {
	process.stderr.write(String(error) + '\n');
	process.exitCode = 1;
});
