import {expect, test} from 'bun:test';
import {PassThrough, Writable} from 'node:stream';
import type {Page} from '../browser/BrowserPage';
import type {CaptureScreenshotRequest} from '../browser/devtools-types';
import type {
	RemotionRawFrame,
	RemotionSharedMemoryPoolLifetime,
} from '../remotion-shared-memory';
import {RemotionSharedMemoryCapture} from '../remotion-shared-memory';
import {
	createRemotionSharedMemoryFfmpegBridge,
	parseRemotionSharedMemoryAck,
	serializeRemotionSharedMemoryFrame,
	serializeRemotionSharedMemoryPool,
	serializeRemotionSharedMemoryPoolRetirement,
} from '../remotion-shared-memory-ffmpeg';
import {screenshotTask} from '../screenshot-task';

const makePoolLifetime = (): {
	poolLifetime: RemotionSharedMemoryPoolLifetime;
	retire: () => Promise<void>;
} => {
	let retired = false;
	let retirement: Promise<void> | null = null;
	let notifyRetirement!: () => void;
	const retirementSignal = new Promise<void>((resolve) => {
		notifyRetirement = resolve;
	});
	const listeners = new Set<() => Promise<void>>();
	const poolLifetime: RemotionSharedMemoryPoolLifetime = {
		isRetired: () => retired,
		waitForRetirement: () => retirementSignal,
		onRetired: (listener) => {
			if (retired) {
				return null;
			}

			listeners.add(listener);
			return () => listeners.delete(listener);
		},
	};

	return {
		poolLifetime,
		retire: () => {
			if (!retirement) {
				retired = true;
				notifyRetirement();
				retirement = Promise.all(
					[...listeners].map((listener) => listener()),
				).then(() => undefined);
			}

			return retirement;
		},
	};
};

const makeRawFrame = (
	release: () => Promise<void>,
	poolLifetime = makePoolLifetime().poolLifetime,
): RemotionRawFrame => ({
	type: 'remotion-shared-memory',
	poolId: 4,
	sharedMemoryName: '/rmshm-123',
	slotCount: 2,
	slotCapacity: 1088,
	slot: 1,
	frameId: '9007199254740993',
	width: 16,
	height: 16,
	stride: 64,
	byteLength: 1024,
	pixelFormat: 'bgra',
	alphaType: 'straight',
	colorSpace: 'srgb',
	capturePath: 'viewport-redraw',
	poolLifetime,
	release,
});

test('bridges frame descriptors and releases Chromium slots on matching ACKs', async () => {
	const control = new PassThrough();
	const acknowledgements = new PassThrough();
	let controlOutput = '';
	control.on('data', (data) => {
		controlOutput += data.toString();
	});
	const lifetime = makePoolLifetime();
	let releases = 0;
	const frame = makeRawFrame(() => {
		releases++;
		return Promise.resolve();
	}, lifetime.poolLifetime);
	const bridge = createRemotionSharedMemoryFfmpegBridge({
		control,
		acknowledgements,
	});

	const {waitForAck} = await bridge.writeFrame({frame, pts: 7});
	expect(controlOutput).toBe(
		serializeRemotionSharedMemoryPool(frame) +
			serializeRemotionSharedMemoryFrame({frame, pts: 7}),
	);
	expect(releases).toBe(0);

	acknowledgements.write('4\t1\t9007199254740993\n');
	await waitForAck;
	expect(releases).toBe(1);
	expect(parseRemotionSharedMemoryAck('4\t1\t9007199254740993')).toEqual({
		poolId: 4,
		slot: 1,
		frameId: '9007199254740993',
	});

	await bridge.finish();
	await lifetime.retire();
	expect(controlOutput).not.toContain(
		serializeRemotionSharedMemoryPoolRetirement(frame.poolId),
	);
	expect(() => parseRemotionSharedMemoryAck('4\t1\tunsafe\n')).toThrow(
		'Invalid Remotion shared-memory ACK',
	);
});

test('unregisters a retired pool only after its final frame ACK', async () => {
	const control = new PassThrough();
	const acknowledgements = new PassThrough();
	let controlOutput = '';
	control.on('data', (data) => {
		controlOutput += data.toString();
	});
	const lifetime = makePoolLifetime();
	let releases = 0;
	const frame = makeRawFrame(() => {
		releases++;
		return Promise.resolve();
	}, lifetime.poolLifetime);
	const bridge = createRemotionSharedMemoryFfmpegBridge({
		control,
		acknowledgements,
	});

	const {waitForAck} = await bridge.writeFrame({frame, pts: 3});
	let retirementFinished = false;
	const retirement = lifetime.retire().then(() => {
		retirementFinished = true;
	});
	await Promise.resolve();
	expect(retirementFinished).toBe(false);
	expect(controlOutput).not.toContain(
		serializeRemotionSharedMemoryPoolRetirement(frame.poolId),
	);

	acknowledgements.write('4\t1\t9007199254740993\n');
	await waitForAck;
	await retirement;
	expect(releases).toBe(1);
	expect(controlOutput).toBe(
		serializeRemotionSharedMemoryPool(frame) +
			serializeRemotionSharedMemoryFrame({frame, pts: 3}) +
			serializeRemotionSharedMemoryPoolRetirement(frame.poolId),
	);
	await bridge.finish();
});

test('does not register or unregister a pool retired before bridge ownership', async () => {
	const control = new PassThrough();
	const acknowledgements = new PassThrough();
	let controlOutput = '';
	control.on('data', (data) => {
		controlOutput += data.toString();
	});
	const lifetime = makePoolLifetime();
	await lifetime.retire();
	let releases = 0;
	const frame = makeRawFrame(() => {
		releases++;
		return Promise.resolve();
	}, lifetime.poolLifetime);
	const bridge = createRemotionSharedMemoryFfmpegBridge({
		control,
		acknowledgements,
	});

	await expect(bridge.writeFrame({frame, pts: 0})).rejects.toThrow(
		'Target closed',
	);
	expect(releases).toBe(1);
	expect(controlOutput).toBe('');
	await bridge.finish();
});

test('settles and releases frames when the ACK or bridge fails', async () => {
	const control = new PassThrough();
	const acknowledgements = new PassThrough();
	let failedReleaseCalls = 0;
	const failedReleaseFrame = makeRawFrame(() => {
		failedReleaseCalls++;
		return Promise.reject(new Error('CDP release failed'));
	});
	const bridge = createRemotionSharedMemoryFfmpegBridge({
		control,
		acknowledgements,
	});
	const {waitForAck} = await bridge.writeFrame({
		frame: failedReleaseFrame,
		pts: 0,
	});
	acknowledgements.write('4\t1\t9007199254740993\n');
	await expect(waitForAck).rejects.toThrow('CDP release failed');
	expect(failedReleaseCalls).toBe(1);

	const writeError = new Error('control pipe failed');
	const failedControl = new Writable({
		highWaterMark: 1,
		write: (_chunk, _encoding, callback) => callback(writeError),
	});
	const unusedAcknowledgements = new PassThrough();
	const writeFailureLifetime = makePoolLifetime();
	let writeFailureReleases = 0;
	const writeFailureFrame = makeRawFrame(() => {
		writeFailureReleases++;
		return Promise.resolve();
	}, writeFailureLifetime.poolLifetime);
	const failedBridge = createRemotionSharedMemoryFfmpegBridge({
		control: failedControl,
		acknowledgements: unusedAcknowledgements,
	});
	await expect(
		failedBridge.writeFrame({frame: writeFailureFrame, pts: 0}),
	).rejects.toThrow('control pipe failed');
	await writeFailureLifetime.retire();
	await new Promise((resolve) => setTimeout(resolve, 0));
	expect(writeFailureReleases).toBe(1);
});

test('treats an ACK pipe EOF before finish as fatal', async () => {
	const control = new PassThrough();
	const acknowledgements = new PassThrough();
	const bridge = createRemotionSharedMemoryFfmpegBridge({
		control,
		acknowledgements,
	});
	acknowledgements.end();
	await new Promise((resolve) => acknowledgements.once('end', resolve));
	await Promise.resolve();

	let releases = 0;
	const frame = makeRawFrame(() => {
		releases++;
		return Promise.resolve();
	});
	await expect(bridge.writeFrame({frame, pts: 0})).rejects.toThrow(
		'before input finished',
	);
	expect(releases).toBe(1);
	control.end();
});

test('signals pool retirement before waiting for an unhanded frame to drain', async () => {
	const calls: string[] = [];
	const client = {
		send: (method: string) => {
			calls.push(method);
			if (method === 'Page.remotionCreateFramePool') {
				return Promise.resolve({
					value: {
						sharedMemoryName: '/rmshm-retirement',
						slotCount: 1,
						slotCapacity: 1088,
					},
				});
			}

			return Promise.resolve({value: undefined});
		},
	};
	const page = {
		_client: () => client,
		target: () => ({_targetId: 'target'}),
	} as unknown as Page;
	const capture = new RemotionSharedMemoryCapture({
		width: 16,
		height: 16,
		indent: false,
		logLevel: 'error',
	});
	await capture.ensurePage(page);
	const reservation = await capture.acquire(page);
	if (!reservation) {
		throw new Error('Expected a shared-memory reservation.');
	}

	const frame = await reservation.publish({
		slot: reservation.slot,
		frameId: reservation.frameId,
		width: 16,
		height: 16,
		stride: 64,
		byteLength: 1024,
		pixelFormat: 'bgra',
		alphaType: 'straight',
		colorSpace: 'srgb',
		capturePath: 'viewport-redraw',
	});
	let forgotten = false;
	const forget = capture.forgetPage(page).then(() => {
		forgotten = true;
	});
	await frame.poolLifetime.waitForRetirement();
	await Promise.resolve();
	expect(forgotten).toBe(false);
	expect(calls).not.toContain('Page.remotionDestroyFramePool');

	await frame.release();
	await forget;
	expect(calls).toContain('Page.remotionDestroyFramePool');
});

test('releases a published frame if transparent background reset fails', async () => {
	let backgroundCalls = 0;
	let releaseCalls = 0;
	const client = {
		send: (
			method: string,
			params?: Record<string, unknown>,
		): Promise<{value: unknown}> => {
			if (method === 'Page.remotionCreateFramePool') {
				return Promise.resolve({
					value: {
						sharedMemoryName: '/rmshm-reset',
						slotCount: 1,
						slotCapacity: 1088,
					},
				});
			}

			if (method === 'Page.captureScreenshot') {
				const request = params as CaptureScreenshotRequest;
				return Promise.resolve({
					value: {
						data: '',
						remotionFrame: {
							slot: request.remotionFrameSlot,
							frameId: request.remotionFrameId,
							width: 16,
							height: 16,
							stride: 64,
							byteLength: 1024,
							pixelFormat: 'bgra',
							alphaType: 'straight',
							colorSpace: 'srgb',
							capturePath: 'viewport-redraw',
						},
					},
				});
			}

			if (method === 'Emulation.setDefaultBackgroundColorOverride') {
				backgroundCalls++;
				if (backgroundCalls === 2) {
					return Promise.reject(new Error('background reset failed'));
				}
			}

			if (method === 'Page.remotionReleaseFrame') {
				releaseCalls++;
			}

			return Promise.resolve({value: undefined});
		},
	};
	const page = {
		_client: () => client,
		target: () => ({_targetId: 'target'}),
	} as unknown as Page;
	const capture = new RemotionSharedMemoryCapture({
		width: 16,
		height: 16,
		indent: false,
		logLevel: 'error',
	});
	await capture.ensurePage(page);

	await expect(
		screenshotTask({
			format: 'png',
			height: 16,
			width: 16,
			omitBackground: true,
			page,
			jpegQuality: undefined,
			scale: 1,
			remotionSharedMemory: capture,
		}),
	).rejects.toThrow('background reset failed');
	expect(releaseCalls).toBe(1);
	await capture.destroy();
});

test('uses raw viewport capture for every video image format and falls back on vanilla Chrome', async () => {
	const rawCaptureRequests: CaptureScreenshotRequest[] = [];
	const released: Array<{slot: number; frameId: string}> = [];
	const rawClient = {
		send: (method: string, params?: Record<string, unknown>) => {
			if (method === 'Page.remotionCreateFramePool') {
				return Promise.resolve({
					value: {
						sharedMemoryName: '/rmshm-test',
						slotCount: 1,
						slotCapacity: 1088,
					},
				});
			}

			if (method === 'Page.captureScreenshot') {
				const request = params as CaptureScreenshotRequest;
				rawCaptureRequests.push(request);
				return Promise.resolve({
					value: {
						data: '',
						remotionFrame: {
							slot: request.remotionFrameSlot,
							frameId: request.remotionFrameId,
							width: 16,
							height: 16,
							stride: 64,
							byteLength: 1024,
							pixelFormat: 'bgra',
							alphaType: request.format === 'jpeg' ? 'opaque' : 'straight',
							colorSpace: 'srgb',
							capturePath: 'viewport-redraw',
						},
					},
				});
			}

			if (method === 'Page.remotionReleaseFrame') {
				released.push(params as {slot: number; frameId: string});
			}

			return Promise.resolve({value: undefined});
		},
	};
	const rawPage = {
		_client: () => rawClient,
		target: () => ({_targetId: 'target'}),
	} as unknown as Page;
	const rawCapture = new RemotionSharedMemoryCapture({
		width: 16,
		height: 16,
		indent: false,
		logLevel: 'error',
	});
	await rawCapture.ensurePage(rawPage);

	for (const format of ['jpeg', 'png', 'webp'] as const) {
		const frame = await screenshotTask({
			format,
			height: 16,
			width: 16,
			omitBackground: format !== 'jpeg',
			page: rawPage,
			jpegQuality: format === 'jpeg' ? 80 : undefined,
			scale: 1,
			remotionSharedMemory: rawCapture,
		});
		expect(Buffer.isBuffer(frame)).toBe(false);
		if (!Buffer.isBuffer(frame)) {
			await frame.release();
		}
	}

	expect(
		rawCaptureRequests.map((request) => ({
			format: request.format,
			fast: request.remotionFastViewport,
			hasSlot: request.remotionFrameSlot !== undefined,
		})),
	).toEqual([
		{format: 'jpeg', fast: true, hasSlot: true},
		{format: 'png', fast: true, hasSlot: true},
		{format: 'webp', fast: true, hasSlot: true},
	]);
	expect(released).toHaveLength(3);
	await rawCapture.destroy();

	const fallbackRequests: CaptureScreenshotRequest[] = [];
	const vanillaClient = {
		send: (method: string, params?: Record<string, unknown>) => {
			if (method === 'Page.remotionCreateFramePool') {
				return Promise.reject(
					new Error(
						"Protocol error (Page.remotionCreateFramePool): 'Page.remotionCreateFramePool' wasn't found",
					),
				);
			}

			if (method === 'Page.captureScreenshot') {
				fallbackRequests.push(params as CaptureScreenshotRequest);
				return Promise.resolve({
					value: {data: Buffer.from('jpeg').toString('base64')},
				});
			}

			return Promise.resolve({value: undefined});
		},
	};
	const vanillaPage = {
		_client: () => vanillaClient,
		target: () => ({_targetId: 'target'}),
	} as unknown as Page;
	const fallbackCapture = new RemotionSharedMemoryCapture({
		width: 16,
		height: 16,
		indent: false,
		logLevel: 'error',
	});
	await fallbackCapture.ensurePage(vanillaPage);
	const encoded = await screenshotTask({
		format: 'jpeg',
		height: 16,
		width: 16,
		omitBackground: false,
		page: vanillaPage,
		jpegQuality: 80,
		scale: 1,
		remotionSharedMemory: fallbackCapture,
	});
	expect(encoded).toEqual(Buffer.from('jpeg'));
	expect(fallbackRequests[0]?.remotionFastViewport).toBeUndefined();
	expect(fallbackRequests[0]?.remotionFrameSlot).toBeUndefined();
});
