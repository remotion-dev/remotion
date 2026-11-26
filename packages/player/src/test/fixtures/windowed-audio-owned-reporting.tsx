import {mock} from 'bun:test';
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import type {DelayRenderScope} from 'remotion';

const main = async () => {
	const mode = process.argv[2];
	const failure = new Error('controlled metadata failure');
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
	const bunnyPath = Bun.resolveSync(
		'mediabunny',
		resolve(__dirname, '../../../../media-utils'),
	);
	const bunny = await import(bunnyPath);
	const inputs: ControlledInput[] = [];
	class ControlledInput {
		disposed = false;
		resolveMetadata: (duration: number) => void = () => undefined;
		rejectMetadata: (error: unknown) => void = () => undefined;
		constructor() {
			if (mode.includes('constructor')) throw failure;
			inputs.push(this);
		}

		computeDuration() {
			return new Promise<number>((resolveMetadata, rejectMetadata) => {
				this.resolveMetadata = resolveMetadata;
				this.rejectMetadata = rejectMetadata;
			});
		}

		getPrimaryAudioTrack() {
			return Promise.resolve({
				numberOfChannels: 1,
				isLive: () => Promise.resolve(false),
				isRelativeToUnixEpoch: () => Promise.resolve(false),
				canDecode: () => Promise.resolve(true),
				getNumberOfChannels: () => Promise.resolve(1),
				getSampleRate: () => Promise.resolve(48000),
			});
		}

		getFormat() {
			return Promise.resolve(null);
		}

		dispose() {
			if (this.disposed) return;
			this.disposed = true;
			this.rejectMetadata(new bunny.InputDisposedError());
		}
	}

	mock.module(bunnyPath, () => ({...bunny, Input: ControlledInput}));
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
	const {useWindowedAudioData} = await import(
		resolve(__dirname, '../../../../media-utils/src/use-windowed-audio-data.ts')
	);
	const scope: DelayRenderScope = {
		remotion_renderReady: true,
		remotion_delayRenderHandles: [],
		remotion_delayRenderTimeouts: {},
		remotion_puppeteerTimeout: 30000,
		remotion_attempt: 1,
	};
	let siblingHandle: number | null = null;
	let releaseSibling: (() => void) | null = null;
	const Healthy = () => {
		const {delayRender, continueRender} = useDelayRender();
		useLayoutEffect(() => {
			const handle = delayRender('healthy sibling');
			siblingHandle = handle;
			releaseSibling = () => continueRender(handle);
			return () => continueRender(handle);
		}, [delayRender, continueRender]);
		return <span>healthy sibling</span>;
	};

	const Content = ({src}: {readonly src: string}) => {
		useWindowedAudioData({src, frame: 100, fps: 30, windowInSeconds: 1});
		return <span>audio {src}</span>;
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
	const scene = (src: string) => (
		<core.Internals.DelayRenderContextType.Provider value={scope}>
			{mode.startsWith('thumbnail') ? (
				<Thumbnail
					{...config}
					component={Content}
					inputProps={{src}}
					frameToDisplay={0}
					errorFallback={fallback}
				/>
			) : (
				<Player
					{...config}
					component={Content}
					inputProps={{src}}
					errorFallback={fallback}
				/>
			)}
			<Player {...config} component={Healthy} />
		</core.Internals.DelayRenderContextType.Provider>
	);
	const flush = () => new Promise<void>((done) => setTimeout(done, 0));
	const metadataHolds = () =>
		scope.remotion_delayRenderHandles.filter((handle) => {
			const allocation = allocations.get(handle);
			return (
				allocation?.scope === scope &&
				allocation.label?.startsWith('Waiting for audio metadata')
			);
		});
	try {
		const view = render(scene('http://localhost:3000/first.wav'));
		await act(flush);
		if (!mode.includes('constructor')) {
			assert.equal(inputs.length, 1);
			assert.equal(metadataHolds().length, 1);
			assert(scope.remotion_delayRenderHandles.includes(siblingHandle!));
			if (mode.includes('stale')) {
				view.rerender(scene('http://localhost:3000/second.wav'));
				await act(flush);
				assert.equal(inputs.length, 2);
				assert.equal(inputs[0].disposed, true);
				assert.equal(metadataHolds().length, 1);
				assert(scope.remotion_delayRenderHandles.includes(siblingHandle!));
			}

			if (mode.includes('unmount')) {
				view.unmount();
				await act(flush);
				assert.equal(scope.remotion_delayRenderHandles.length, 0);
				assert.equal(scope.remotion_renderReady, true);
				assert.equal(inputs[0].disposed, true);
				process.stdout.write(JSON.stringify({mode, unmounted: true}) + '\n');
				return;
			}

			await act(async () => {
				if (mode.includes('success') || mode.includes('stale'))
					inputs.at(-1)!.resolveMetadata(0);
				else inputs.at(-1)!.rejectMetadata(failure);
				await flush();
			});
		}

		if (mode.includes('success') || mode.includes('stale'))
			assert.equal(view.queryByRole('alert'), null);
		else
			assert.equal(
				view.getByRole('alert', {hidden: true}).textContent,
				failure.message,
			);
		view.getByText('healthy sibling');
		assert.equal(scope.remotion_cancelledError, undefined);
		assert.equal(scope.remotion_cancelledErrorObject, undefined);
		assert.deepEqual(metadataHolds(), []);
		assert(scope.remotion_delayRenderHandles.includes(siblingHandle!));
		assert.equal(scope.remotion_renderReady, false);
		assert.notEqual(releaseSibling, null);
		(releaseSibling as unknown as () => void)();
		await waitFor(() => {
			assert.deepEqual(scope.remotion_delayRenderHandles, []);
			assert.equal(scope.remotion_renderReady, true);
		});
		view.unmount();
		await act(flush);
		process.stdout.write(
			JSON.stringify({mode, ready: scope.remotion_renderReady}) + '\n',
		);
	} finally {
		cleanup();
		mock.restore();
	}
};

main().catch((error: unknown) => {
	process.stderr.write(String(error) + '\n');
	process.exitCode = 1;
});
