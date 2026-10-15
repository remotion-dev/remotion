import {afterEach, expect, mock, spyOn, test} from 'bun:test';
import type {DownloadMap} from '../assets/download-map';
import type {Page} from '../browser/BrowserPage';
import * as collectAssetsModule from '../collect-assets';
import * as frameTimeoutModule from '../frame-timeout';
import {FrameTimeoutError, getFrameTimeout} from '../frame-timeout';
import type {LogLevel} from '../log-level';
import {nextFrameToRenderState} from '../next-frame-to-render';
import {Pool} from '../pool';
import {renderFrameAndRetryTargetClose} from '../render-frame-and-retry-target-close';
import type {BrowserReplacer} from '../replace-browser';
import * as seekToFrameModule from '../seek-to-frame';
import * as takeFrameModule from '../take-frame';

const timeoutInMilliseconds = 50;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const neverSettles = () => new Promise<void>(() => undefined);
const spies: {mockRestore: () => void}[] = [];

afterEach(() => {
	for (const spy of spies.splice(0)) {
		spy.mockRestore();
	}
});

const makeTab = () => {
	const errorListeners = new Set<(err: Error) => void>();
	const close = mock(() => Promise.resolve());
	const page = {
		pageIndex: 0,
		close,
		on: (_event: string, listener: (err: Error) => void) => {
			errorListeners.add(listener);
		},
		off: (_event: string, listener: (err: Error) => void) => {
			errorListeners.delete(listener);
		},
		_client: () => ({on: () => undefined, off: () => undefined}),
	} as unknown as Page;
	const crash = () => {
		for (const listener of errorListeners) {
			listener(new Error('Page crashed!'));
		}
	};

	return {page, close, crash};
};

const renderTwoFrames = ({
	tab,
	newTab,
	seek,
	logLevel,
}: {
	tab: Page;
	newTab: Page;
	seek: typeof seekToFrameModule.seekToFrame;
	logLevel: LogLevel;
}) => {
	const seekToFrame = spyOn(
		seekToFrameModule,
		'seekToFrame',
	).mockImplementation(seek);
	spies.push(
		seekToFrame,
		spyOn(takeFrameModule, 'takeFrame').mockResolvedValue(
			Buffer.from('frame') as never,
		),
		spyOn(collectAssetsModule, 'collectAssets').mockResolvedValue([]),
		spyOn(frameTimeoutModule, 'getFrameTimeout').mockReturnValue(
			timeoutInMilliseconds * 2,
		),
	);
	const pool = new Pool([tab]);
	const makeNewPage = mock(() => Promise.resolve(newTab));
	const replaceBrowser = mock();
	const delivered: number[] = [];

	const input: Parameters<typeof renderFrameAndRetryTargetClose>[0] = {
		retriesLeft: 1,
		attempt: 1,
		assets: [],
		assetIndex: {
			firstAssetBySrc: new Map(),
			firstArtifactFrameByFilename: new Map(),
		},
		imageFormat: 'jpeg',
		binariesDirectory: null,
		cancelSignal: undefined,
		composition: {
			id: 'stuck-frame',
			width: 100,
			height: 100,
			fps: 30,
			durationInFrames: 2,
			defaultCodec: null,
			defaultOutName: null,
			defaultVideoImageFormat: null,
			defaultPixelFormat: null,
			defaultProResProfile: null,
			defaultSampleRate: null,
		},
		countType: 'actual-frames',
		downloadMap: {} as DownloadMap,
		frameDir: '',
		framesToRender: [0, 1],
		jpegQuality: 80,
		onArtifact: null,
		onDownload: null,
		onError: () => undefined,
		outputDir: null,
		poolPromise: Promise.resolve(pool),
		scale: 1,
		stoppedSignal: {stopped: false},
		timeoutInMilliseconds,
		indent: false,
		logLevel,
		makeBrowser: () => Promise.reject(new Error('Unexpected new browser')),
		makeNewPage,
		browserReplacer: {replaceBrowser} as unknown as BrowserReplacer,
		concurrencyOrFramesToRender: 1,
		framesRenderedObj: {count: 0},
		lastFrame: 1,
		onFrameBuffer: (_buffer, frame) => {
			delivered.push(frame);
		},
		onFrame: null,
		remotionSharedMemory: null,
		onFrameUpdate: null,
		nextFrameToRender: nextFrameToRenderState({
			allFramesAndExtraFrames: [0, 1],
		}),
		imageSequencePattern: null,
		trimLeftOffset: 0,
		trimRightOffset: 0,
		allFramesAndExtraFrames: [0, 1],
	};

	return {
		done: Promise.all([0, 1].map(() => renderFrameAndRetryTargetClose(input))),
		pool,
		seekToFrame,
		makeNewPage,
		replaceBrowser,
		delivered,
	};
};

test(
	'Should retry a frame on a new tab if rendering it never finishes',
	async () => {
		const tab = makeTab();
		const newTab = makeTab();
		const {done, delivered, makeNewPage, replaceBrowser, seekToFrame} =
			renderTwoFrames({
				tab: tab.page,
				newTab: newTab.page,
				seek: ({frame, attempt}) =>
					frame === 1 && attempt === 1 ? neverSettles() : Promise.resolve(),
				logLevel: 'error',
			});

		await done;

		expect(delivered).toEqual([0, 1]);
		expect(tab.close).toHaveBeenCalled();
		expect(makeNewPage).toHaveBeenCalledTimes(1);
		expect(makeNewPage).toHaveBeenCalledWith(1, 0);
		expect(replaceBrowser).not.toHaveBeenCalled();
		const [lastSeek] =
			seekToFrame.mock.calls[seekToFrame.mock.calls.length - 1];
		expect(lastSeek.frame).toBe(1);
		expect(lastSeek.page).toBe(newTab.page);
	},
	{timeout: 2000},
);

test('Should not close the tab after a frame rendered fine', async () => {
	const tab = makeTab();
	const {done, pool} = renderTwoFrames({
		tab: tab.page,
		newTab: makeTab().page,
		seek: () => Promise.resolve(),
		logLevel: 'error',
	});

	await done;
	await wait(timeoutInMilliseconds * 3);

	expect(tab.close).not.toHaveBeenCalled();
	expect(pool.resources).toEqual([tab.page]);
});

test('Should not close the tab later if the frame already failed', async () => {
	const tab = makeTab();
	const {done} = renderTwoFrames({
		tab: tab.page,
		newTab: makeTab().page,
		seek: ({frame}) => {
			if (frame !== 1) {
				return Promise.resolve();
			}

			tab.crash();
			return neverSettles();
		},
		logLevel: 'error',
	});

	await expect(done).rejects.toThrow('Page crashed!');
	await wait(timeoutInMilliseconds * 3);

	expect(tab.close).not.toHaveBeenCalled();
});

test(
	'Should give up with its own warning if a frame keeps getting stuck',
	async () => {
		const warn = spyOn(console, 'warn').mockImplementation(() => undefined);
		spies.push(warn);
		const {done} = renderTwoFrames({
			tab: makeTab().page,
			newTab: makeTab().page,
			seek: ({frame}) => (frame === 1 ? neverSettles() : Promise.resolve()),
			logLevel: 'warn',
		});

		await expect(done).rejects.toBeInstanceOf(FrameTimeoutError);

		const warnings = warn.mock.calls.map((args) => args.join(' '));
		expect(warnings[warnings.length - 1]).toContain(
			'Frame 1 got stuck on attempt 2. Not retrying anymore.',
		);
		expect(warnings.join('\n')).not.toContain('crashed');
	},
	{timeout: 2000},
);

test('Should only count a frame as stuck after all of its timeouts ran out', () => {
	expect(getFrameTimeout(30_000)).toBe(126_000);
	expect(getFrameTimeout(2_000_000_000)).toBe(2 ** 31 - 1);
});

test('Should not retry an error that only looks like a stuck frame', async () => {
	const {done, makeNewPage} = renderTwoFrames({
		tab: makeTab().page,
		newTab: makeTab().page,
		seek: ({frame}) =>
			frame === 1
				? Promise.reject(new Error('Rendering frame 1 took longer than 100ms'))
				: Promise.resolve(),
		logLevel: 'error',
	});

	await expect(done).rejects.toThrow(
		'Rendering frame 1 took longer than 100ms',
	);
	expect(makeNewPage).not.toHaveBeenCalled();
});
