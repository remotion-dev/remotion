import {mock} from 'bun:test';
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import type {DelayRenderScope} from 'remotion';

const main = async () => {
	const mode = process.argv[2];
	const stage = mode.slice(mode.indexOf('-') + 1);
	const failure = new Error('controlled transition failure', {
		cause: new Error('original cause'),
	});
	const delayPath = resolve(
		__dirname,
		'../../../../core/dist/cjs/delay-render.js',
	);
	const actualDelay = await import(delayPath);
	const allocate = actualDelay.delayRenderInternal;
	const allocations = new Map<
		number,
		{scope: DelayRenderScope; label: string | null}
	>();
	mock.module(delayPath, () => ({
		...actualDelay,
		delayRenderInternal: (options: {
			scope: DelayRenderScope;
			label: string | null;
		}) => {
			const handle = allocate(options);
			allocations.set(handle, options);
			return handle;
		},
	}));
	type Pending = {
		resolve: (value: boolean) => void;
		reject: (error: unknown) => void;
	};
	const pending: Pending[] = [];
	const runnerPath = resolve(
		__dirname,
		'../../../../core/dist/cjs/effects/run-effect-chain.js',
	);
	const actualRunner = await import(runnerPath);
	mock.module(runnerPath, () => ({
		...actualRunner,
		runEffectChain: () =>
			new Promise<boolean>((resolveRun, rejectRun) => {
				pending.push({resolve: resolveRun, reject: rejectRun});
			}),
	}));
	class CanvasStub {
		width: number;
		height: number;
		constructor(width: number, height: number) {
			this.width = width;
			this.height = height;
		}

		getContext() {
			return {
				canvas: this,
				reset: () => undefined,
				drawElementImage: () => undefined,
				clearRect: () => undefined,
			};
		}
	}

	Object.defineProperty(globalThis, 'OffscreenCanvas', {
		configurable: true,
		value: CanvasStub,
	});
	Object.defineProperty(globalThis, 'ResizeObserver', {
		configurable: true,
		value: class {
			observe() {}
			unobserve() {}
			disconnect() {}
		},
	});
	let closedImages = 0;
	HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement) {
		return {
			canvas: this,
			reset: () => undefined,
			drawElementImage: () => undefined,
			clearRect: () => undefined,
		} as unknown as CanvasRenderingContext2D;
	} as unknown as typeof HTMLCanvasElement.prototype.getContext;
	HTMLCanvasElement.prototype.requestPaint = () => undefined;
	HTMLCanvasElement.prototype.captureElementImage = () =>
		({
			width: 32,
			height: 32,
			close: () => {
				closedImages++;
			},
		}) as ElementImage;
	HTMLCanvasElement.prototype.transferControlToOffscreen = function (
		this: HTMLCanvasElement,
	) {
		return new CanvasStub(
			this.width,
			this.height,
		) as unknown as OffscreenCanvas;
	};

	const core = require(
		resolve(__dirname, '../../../../core/dist/cjs/index.js'),
	);
	mock.module('remotion', () => core);
	const {act, cleanup, render, waitFor} =
		await import('@testing-library/react');
	const {useLayoutEffect} = await import('react');
	const {useDelayRender} = await import('remotion');
	const {Player} = await import('../../Player.js');
	const {Thumbnail} = await import('../../Thumbnail.js');
	const {HtmlInCanvasPresentation} = await import(
		resolve(
			__dirname,
			'../../../../transitions/src/html-in-canvas-presentation.tsx',
		)
	);
	assert.equal(core.HtmlInCanvas.isSupported(), true);
	const scope: DelayRenderScope = {
		remotion_renderReady: true,
		remotion_delayRenderHandles: [],
		remotion_delayRenderTimeouts: {},
		remotion_puppeteerTimeout: 30000,
		remotion_attempt: 1,
	};
	type Draw = (
		prev: OffscreenCanvas | null,
		next: OffscreenCanvas | null,
		progress: number,
	) => unknown;
	let capturedDraw: Draw | null = null;
	let siblingHandle: number | null = null;
	let replacementHandle: number | null = null;
	let releaseSibling: (() => void) | null = null;
	let releaseReplacement: (() => void) | null = null;
	const Healthy = () => {
		const {delayRender, continueRender} = useDelayRender();
		useLayoutEffect(() => {
			const handle = delayRender('healthy transition sibling');
			siblingHandle = handle;
			releaseSibling = () => continueRender(handle);
			return () => continueRender(handle);
		}, [delayRender, continueRender]);
		return <span>healthy transition sibling</span>;
	};

	const Replacement = () => {
		const {delayRender, continueRender} = useDelayRender();
		useLayoutEffect(() => {
			const handle = delayRender('healthy transition replacement');
			replacementHandle = handle;
			releaseReplacement = () => continueRender(handle);
			return () => continueRender(handle);
		}, [delayRender, continueRender]);
		return <span>healthy transition replacement</span>;
	};

	let clears = 0;
	let shaderCleanups = 0;
	const shader = () => ({
		clear: () => {
			clears++;
		},
		cleanup: () => {
			shaderCleanups++;
		},
		draw: () => {
			if (stage === 'shader') throw failure;
		},
	});
	const receive = (_image: OffscreenCanvas, draw: Draw) => {
		capturedDraw = draw;
	};

	const onUnmount = () => undefined;
	const Content = () => {
		const presentation = (
			<HtmlInCanvasPresentation
				shader={shader}
				effects={null}
				effectsOutputSize={null}
				passedProps={{}}
				presentationProgress={0.5}
				presentationDirection="entering"
				presentationDurationInFrames={10}
				onElementImage={receive}
				onUnmount={onUnmount}
				bothEnteringAndExiting={false}
			>
				<span>transition content</span>
			</HtmlInCanvasPresentation>
		);
		return stage === 'fatal' ? (
			<core.Internals.CancelRenderContext.Provider value={null}>
				{presentation}
			</core.Internals.CancelRenderContext.Provider>
		) : (
			presentation
		);
	};

	const config = {
		compositionWidth: 32,
		compositionHeight: 32,
		durationInFrames: 30,
		fps: 30,
	};
	const fallback = ({error}: {error: Error}) => (
		<div role="alert">{error.message}</div>
	);
	const scene = (replace: boolean) => (
		<core.Internals.DelayRenderContextType.Provider value={scope}>
			{mode.startsWith('thumbnail') ? (
				<Thumbnail
					{...config}
					component={replace ? Replacement : Content}
					frameToDisplay={0}
					errorFallback={fallback}
				/>
			) : (
				<Player
					{...config}
					component={replace ? Replacement : Content}
					errorFallback={fallback}
				/>
			)}
			<Player {...config} component={Healthy} />
		</core.Internals.DelayRenderContextType.Provider>
	);
	const flush = () => new Promise<void>((done) => setTimeout(done, 0));
	const drawHolds = () =>
		scope.remotion_delayRenderHandles.filter(
			(handle) =>
				allocations.get(handle)?.scope === scope &&
				allocations.get(handle)?.label === 'onPaint',
		);
	const thrown: unknown[] = [];
	try {
		const view = render(scene(false));
		await act(flush);
		const healthyNode = view.getByText('healthy transition sibling');
		const canvas = view.container.querySelector('canvas')!;
		assert.notEqual(canvas, null);
		await act(async () => {
			canvas.dispatchEvent(new Event('paint'));
			await flush();
		});
		assert.notEqual(capturedDraw, null);
		assert.equal(closedImages, 1);
		let drawing: Promise<unknown> = Promise.resolve();
		await act(async () => {
			const input =
				stage === 'empty'
					? null
					: new OffscreenCanvas(stage === 'zero' ? 0 : 32, 32);
			drawing = Promise.resolve(
				(capturedDraw as unknown as Draw)(input, null, 0.5),
			).catch((error: unknown) => {
				thrown.push(error);
			});
			await flush();
		});
		if (!['shader', 'empty', 'zero'].includes(stage)) {
			assert.equal(pending.length, 1);
			assert.equal(drawHolds().length, 1);
			if (stage === 'unmount' || stage === 'replace') {
				if (stage === 'unmount') view.unmount();
				else view.rerender(scene(true));
				await act(flush);
				assert.deepEqual(
					drawHolds(),
					[],
					'retired transition kept its pending draw hold',
				);
				assert.equal(shaderCleanups, 1);
				if (stage === 'replace') {
					assert(
						scope.remotion_delayRenderHandles.includes(replacementHandle!),
					);
					assert(scope.remotion_delayRenderHandles.includes(siblingHandle!));
				}
			}

			await act(async () => {
				if (stage === 'success') pending[0].resolve(true);
				else pending[0].reject(failure);
				await drawing;
				await flush();
			});
		} else
			await act(async () => {
				await drawing;
				await flush();
			});
		assert.deepEqual(drawHolds(), []);
		if (stage === 'fatal') {
			assert.deepEqual(thrown, [failure]);
			assert.equal(scope.remotion_cancelledErrorObject, failure);
			assert.equal(scope.remotion_renderReady, false);
		} else {
			assert.deepEqual(thrown, []);
			assert.equal(scope.remotion_cancelledError, undefined);
			assert.equal(scope.remotion_cancelledErrorObject, undefined);
		}

		if (stage !== 'unmount') {
			assert.equal(view.getByText('healthy transition sibling'), healthyNode);
			assert(scope.remotion_delayRenderHandles.includes(siblingHandle!));
			if (stage === 'effect' || stage === 'shader')
				assert.equal(
					view.getByRole('alert', {hidden: true}).textContent,
					failure.message,
				);
			else assert.equal(view.queryByRole('alert', {hidden: true}), null);
			if (stage === 'replace') {
				view.getByText('healthy transition replacement');
				assert(scope.remotion_delayRenderHandles.includes(replacementHandle!));
				(releaseReplacement as unknown as () => void)();
			}

			(releaseSibling as unknown as () => void)();
			if (stage !== 'fatal')
				await waitFor(() => {
					assert.deepEqual(scope.remotion_delayRenderHandles, []);
					assert.equal(scope.remotion_renderReady, true);
				});
			else assert.equal(scope.remotion_renderReady, false);
			view.unmount();
		}

		if (stage === 'empty' || stage === 'zero') assert.equal(clears, 1);
		assert.equal(shaderCleanups, 1);
		process.stdout.write(
			JSON.stringify({mode, drawHolds: drawHolds(), shaderCleanups}) + '\n',
		);
	} finally {
		cleanup();
		mock.restore();
	}
};

main().catch((error: unknown) => {
	process.stderr.write(Bun.inspect(error, {depth: 6}) + '\n');
	process.exitCode = 1;
});
