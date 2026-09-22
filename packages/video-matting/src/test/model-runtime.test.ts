import {beforeEach, expect, mock, test} from 'bun:test';
import {existsSync} from 'node:fs';
import {mkdtemp, readdir, readFile, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';

let initializationCount = 0;
let initializationStarted: ((count: number) => void) | null = null;
let initializationGate: Promise<void> | null = null;
let initializationOptions: Record<string, unknown> | null = null;
let initializationEnvironment:
	| {remoteHost: string; remotePathTemplate: string}
	| undefined;
const initializedModelIds: string[] = [];
const initializedProcessorModelIds: string[] = [];
let pipelineRunCount = 0;
let livePipelineCount = 0;
let disposeCalls = 0;
let cacheCheck:
	| {task: string; modelId: string; options: Record<string, unknown>}
	| undefined;
let cacheClear:
	| {task: string; modelId: string; options: Record<string, unknown>}
	| undefined;
let cacheCheckEnvironment:
	| {remoteHost: string; remotePathTemplate: string}
	| undefined;
const downloadedFiles = new Map<string, Response>();
const requestedFiles: string[] = [];
let checkDownloadedFiles = false;
const customCache = {
	match: (url: string) => Promise.resolve(downloadedFiles.get(url)?.clone()),
	put: async (url: string, response: Response) => {
		downloadedFiles.set(url, new Response(await response.arrayBuffer()));
	},
};

const originalTransformersEnvironment = {
	remoteHost: 'https://huggingface.co/',
	remotePathTemplate: '{model}/resolve/{revision}/',
	useCustomCache: true,
	customCache,
	useBrowserCache: false,
	useFSCache: false,
	cacheDir: null as string | null,
	cacheKey: 'transformers-cache',
	fetch: (url: string) => {
		requestedFiles.push(url);
		return Promise.resolve(new Response(url));
	},
};
const transformersEnvironment = {...originalTransformersEnvironment};
const preexistingWhisperModelHostState = {
	activeOperations: 0,
	previousRemoteConfiguration: null as
		| typeof originalTransformersEnvironment
		| null,
};
Object.defineProperty(
	transformersEnvironment,
	Symbol.for('@remotion/whisper-webgpu/model-host-state'),
	{value: preexistingWhisperModelHostState},
);

class RawImage {
	public data: Uint8ClampedArray;
	public width: number;
	public height: number;
	public channels: number;

	constructor(
		data: Uint8ClampedArray,
		width: number,
		height: number,
		channels: number,
	) {
		this.data = data;
		this.width = width;
		this.height = height;
		this.channels = channels;
	}
}

function BackgroundRemovalPipeline() {
	livePipelineCount++;
	return Object.assign(
		(image: unknown) => {
			pipelineRunCount++;
			if (image instanceof RawImage) {
				const data = image.data.slice();
				for (let i = 3; i < data.length; i += 4) {
					data[i] = 128;
				}

				return Promise.resolve({...image, data});
			}

			return Promise.resolve({
				data: new Uint8ClampedArray([10, 20, 30, 128]),
				width: 1,
				height: 1,
				channels: 4,
			});
		},
		{
			dispose: () => {
				disposeCalls++;
				livePipelineCount--;
				return Promise.resolve();
			},
		},
	);
}

mock.module('@huggingface/transformers', () => ({
	env: transformersEnvironment,
	AutoModelForImageSegmentation: {
		from_pretrained: async (
			modelId: string,
			options: Record<string, unknown>,
		) => {
			initializationCount++;
			initializedModelIds.push(modelId);
			initializationOptions = options;
			initializationEnvironment = {
				remoteHost: transformersEnvironment.remoteHost,
				remotePathTemplate: transformersEnvironment.remotePathTemplate,
			};
			initializationStarted?.(initializationCount);
			await initializationGate;
			const onProgress = options.progress_callback as
				| ((event: Record<string, unknown>) => void)
				| undefined;
			onProgress?.({
				status: 'progress',
				file: 'onnx/model.onnx',
				loaded: 25_889_088,
			});
			return {dispose: () => Promise.resolve()};
		},
	},
	AutoProcessor: {
		from_pretrained: (modelId: string) => {
			initializedProcessorModelIds.push(modelId);
			return Promise.resolve({});
		},
	},
	BackgroundRemovalPipeline,
	RawImage,
	ModelRegistry: {
		is_pipeline_cached_files: () => {
			const files = ['config.json', 'onnx/model.onnx'].map((file) => ({
				file,
				cached: transformersEnvironment.useFSCache
					? existsSync(
							join(transformersEnvironment.cacheDir!, 'modnet-v1', file),
						)
					: downloadedFiles.has(
							`https://remotion.media/models/modnet-v1/${file}`,
						),
			}));
			return Promise.resolve({
				files,
				allCached: files.every(({cached}) => cached),
			});
		},
		clear_pipeline_cache: (
			task: string,
			modelId: string,
			options: Record<string, unknown>,
		) => {
			cacheClear = {task, modelId, options};
			if (transformersEnvironment.useFSCache) {
				return rm(join(transformersEnvironment.cacheDir!, modelId), {
					recursive: true,
					force: true,
				});
			}

			return Promise.resolve();
		},
		is_pipeline_cached: (
			task: string,
			modelId: string,
			options: Record<string, unknown>,
		) => {
			cacheCheck = {task, modelId, options};
			cacheCheckEnvironment = {
				remoteHost: transformersEnvironment.remoteHost,
				remotePathTemplate: transformersEnvironment.remotePathTemplate,
			};
			return Promise.resolve(
				transformersEnvironment.useFSCache
					? ['config.json', 'onnx/model.onnx'].every((file) =>
							existsSync(
								join(transformersEnvironment.cacheDir!, modelId, file),
							),
						)
					: checkDownloadedFiles
						? downloadedFiles.size === 2
						: true,
			);
		},
	},
}));

const getRuntime = () => import('../load-video-matting-model');

beforeEach(async () => {
	const {disposeVideoMattingModel} = await getRuntime();
	await disposeVideoMattingModel();
	initializationCount = 0;
	initializationStarted = null;
	initializationGate = null;
	initializationOptions = null;
	initializationEnvironment = undefined;
	initializedModelIds.length = 0;
	initializedProcessorModelIds.length = 0;
	pipelineRunCount = 0;
	livePipelineCount = 0;
	disposeCalls = 0;
	cacheCheck = undefined;
	cacheClear = undefined;
	cacheCheckEnvironment = undefined;
	downloadedFiles.clear();
	requestedFiles.length = 0;
	checkDownloadedFiles = false;
	preexistingWhisperModelHostState.activeOperations = 0;
	preexistingWhisperModelHostState.previousRemoteConfiguration = null;
	Object.assign(transformersEnvironment, originalTransformersEnvironment);
});

test('downloads without initializing WebGPU, then initializes from the cached files', async () => {
	checkDownloadedFiles = true;
	transformersEnvironment.useCustomCache = false;
	transformersEnvironment.useBrowserCache = true;
	const originalCaches = Object.getOwnPropertyDescriptor(globalThis, 'caches');
	Object.defineProperty(globalThis, 'caches', {
		configurable: true,
		value: {open: () => Promise.resolve(customCache)},
	});
	try {
		const {downloadVideoMattingModel, loadVideoMattingModel} =
			await import('../index');
		await expect(loadVideoMattingModel({model: 'modnet'})).rejects.toThrow(
			'downloadVideoMattingModel() first',
		);
		const progress: number[] = [];
		const download = await downloadVideoMattingModel({
			model: 'modnet',
			onProgress: ({progress: value}) => progress.push(value),
		});

		expect(download.alreadyDownloaded).toBe(false);
		expect(initializationCount).toBe(0);
		expect(requestedFiles).toEqual([
			'https://remotion.media/models/modnet-v1/config.json',
			'https://remotion.media/models/modnet-v1/onnx/model.onnx',
		]);
		expect(progress.at(-1)).toBe(1);
		downloadedFiles.delete(
			'https://remotion.media/models/modnet-v1/onnx/model.onnx',
		);
		expect(
			(await downloadVideoMattingModel({model: 'modnet'})).alreadyDownloaded,
		).toBe(false);
		expect(requestedFiles.slice(2)).toEqual([requestedFiles[1]]);

		await using loaded = await loadVideoMattingModel({model: 'modnet'});
		expect(loaded.alreadyLoaded).toBe(false);
		expect(initializationCount).toBe(1);
		expect(
			(await downloadVideoMattingModel({model: 'modnet'})).alreadyDownloaded,
		).toBe(true);
		expect(requestedFiles).toHaveLength(3);
	} finally {
		if (originalCaches) {
			Object.defineProperty(globalThis, 'caches', originalCaches);
		} else {
			Reflect.deleteProperty(globalThis, 'caches');
		}
	}
});

test('shares loading, reports progress, and defers disposal while in use', async () => {
	const {
		disposeVideoMattingModel,
		loadVideoMattingModel,
		withLoadedVideoMattingPipeline,
	} = await getRuntime();
	const {isVideoMattingModelCached} =
		await import('../is-video-matting-model-cached');
	let releaseInitialization: () => void = () => undefined;
	initializationGate = new Promise<void>((resolve) => {
		releaseInitialization = resolve;
	});
	const started = new Promise<void>((resolve) => {
		initializationStarted = () => resolve();
	});
	const progress: number[] = [];
	const first = loadVideoMattingModel({
		model: 'modnet',
		onProgress: (event) => {
			if (event.progress !== null) {
				progress.push(event.progress);
			}
		},
	});
	const second = loadVideoMattingModel({model: 'modnet'});

	await started;
	expect(initializationCount).toBe(1);
	expect(initializationEnvironment).toEqual({
		remoteHost: 'https://remotion.media/',
		remotePathTemplate: 'models/{model}/',
	});
	expect(await isVideoMattingModelCached({model: 'modnet'})).toBe(true);
	expect(cacheCheck).toEqual({
		task: 'background-removal',
		modelId: 'modnet-v1',
		options: {device: 'webgpu', dtype: 'fp32'},
	});
	expect(cacheCheckEnvironment).toEqual(initializationEnvironment);
	releaseInitialization();
	expect(
		(await Promise.all([first, second])).map(
			({alreadyLoaded}) => alreadyLoaded,
		),
	).toEqual([false, true]);
	expect(initializationOptions).toMatchObject({
		device: 'webgpu',
		dtype: 'fp32',
	});
	expect(initializationOptions).not.toHaveProperty('revision');
	expect(progress.at(-1)).toBe(1);
	expect(transformersEnvironment).toEqual(originalTransformersEnvironment);

	let releaseUse: () => void = () => undefined;
	const useGate = new Promise<void>((resolve) => {
		releaseUse = resolve;
	});
	let markUseStarted: () => void = () => undefined;
	const useStarted = new Promise<void>((resolve) => {
		markUseStarted = resolve;
	});
	const use = withLoadedVideoMattingPipeline({
		model: 'modnet',
		signal: null,
		run: async (pipeline) => {
			const result = await pipeline({} as OffscreenCanvas);
			markUseStarted();
			await useGate;
			return result;
		},
	});
	await useStarted;
	const disposal = disposeVideoMattingModel({model: 'modnet'});
	await Promise.resolve();
	expect(disposeCalls).toBe(0);
	releaseUse();
	expect((await use).data).toEqual(new Uint8ClampedArray([10, 20, 30, 128]));
	await disposal;
	expect(pipelineRunCount).toBe(1);
	expect(disposeCalls).toBe(1);
	expect(livePipelineCount).toBe(0);
});

test('await using releases a model after its last load handle', async () => {
	const {loadVideoMattingModel} = await import('../index');
	const {withLoadedVideoMattingPipeline} = await getRuntime();

	{
		await using first = await loadVideoMattingModel({model: 'modnet'});
		expect(first.alreadyLoaded).toBe(false);
		{
			await using second = await loadVideoMattingModel({model: 'modnet'});
			expect(second.alreadyLoaded).toBe(true);
			await second[Symbol.asyncDispose]();
		}

		expect(disposeCalls).toBe(0);
		const result = await withLoadedVideoMattingPipeline({
			model: 'modnet',
			signal: null,
			run: (pipeline) => pipeline({} as OffscreenCanvas),
		});
		expect(result.data).toEqual(new Uint8ClampedArray([10, 20, 30, 128]));
	}

	expect(initializationCount).toBe(1);
	expect(pipelineRunCount).toBe(1);
	expect(disposeCalls).toBe(1);
	expect(livePipelineCount).toBe(0);
});

test('an old load handle cannot dispose a replacement model', async () => {
	const {disposeVideoMattingModel, loadVideoMattingModel} =
		await import('../index');
	const oldHandle = await loadVideoMattingModel({model: 'modnet'});
	await disposeVideoMattingModel({model: 'modnet'});
	const newHandle = await loadVideoMattingModel({model: 'modnet'});

	await oldHandle[Symbol.asyncDispose]();
	expect(disposeCalls).toBe(1);
	expect(livePipelineCount).toBe(1);

	await newHandle[Symbol.asyncDispose]();
	expect(disposeCalls).toBe(2);
	expect(livePipelineCount).toBe(0);
});

test('loads every public model from its immutable hosted model ID', async () => {
	const {disposeVideoMattingModel, getAvailableModels, loadVideoMattingModel} =
		await import('../index');
	const models = getAvailableModels();

	for (const model of models) {
		await loadVideoMattingModel({model: model.name});
		await disposeVideoMattingModel({model: model.name});
	}

	expect(initializedProcessorModelIds).toEqual(['modnet-v1', 'ben2-base-v1']);
	expect(initializedModelIds).toEqual(['modnet-v1', 'ben2-base-v1']);
	expect(models.map(({modelId}) => modelId)).toEqual([
		'Xenova/modnet',
		'onnx-community/BEN2-ONNX',
	]);
});

test('removes a model from memory and the persistent cache', async () => {
	const {loadVideoMattingModel} = await getRuntime();
	const {removeVideoMattingModel} =
		await import('../remove-video-matting-model');
	await loadVideoMattingModel({model: 'modnet'});
	await removeVideoMattingModel({model: 'modnet'});

	expect(disposeCalls).toBe(1);
	expect(cacheClear).toEqual({
		task: 'background-removal',
		modelId: 'modnet-v1',
		options: {device: 'webgpu', dtype: 'fp32'},
	});
});

test('coordinates the shared Transformers environment across model loads', async () => {
	const {disposeVideoMattingModel, loadVideoMattingModel} = await getRuntime();
	let releaseInitialization: () => void = () => undefined;
	initializationGate = new Promise<void>((resolve) => {
		releaseInitialization = resolve;
	});
	const bothStarted = new Promise<void>((resolve) => {
		initializationStarted = (count) => {
			if (count === 2) {
				resolve();
			}
		};
	});
	const loads = [
		loadVideoMattingModel({model: 'modnet'}),
		loadVideoMattingModel({model: 'ben2-base'}),
	];

	await bothStarted;
	const environmentWithState =
		transformersEnvironment as typeof transformersEnvironment &
			Record<symbol, unknown>;
	const sharedState =
		environmentWithState[
			Symbol.for('@remotion/whisper-webgpu/model-host-state')
		];
	expect(sharedState).toMatchObject({activeOperations: 2});
	expect(
		environmentWithState[Symbol.for('@remotion/transformers/model-host-state')],
	).toBe(sharedState);
	releaseInitialization();
	expect(
		(await Promise.all(loads)).map(({alreadyLoaded}) => alreadyLoaded),
	).toEqual([false, false]);
	expect(transformersEnvironment).toEqual(originalTransformersEnvironment);
	await disposeVideoMattingModel();
});

// Keep the neural network deterministic; decoding, encoding, pixels, storage,
// cancellation, and the public package workflow all use the real implementation.
test('downloads to disk and separates local video with alpha, audio, and cancellation', async () => {
	const {registerMediabunnyServer} = await import('@mediabunny/server');
	const {
		ALL_FORMATS,
		AudioSample,
		AudioSampleSink,
		AudioSampleSource,
		BlobSource,
		BufferTarget,
		Input,
		Output,
		VideoSample,
		VideoSampleSink,
		VideoSampleSource,
		WebMOutputFormat,
	} = await import('mediabunny');
	const {
		downloadVideoMattingModel,
		isVideoMattingModelCached,
		loadVideoMattingModel,
		removeVideoMattingModel,
		separateVideoLayers,
	} = await import('../index');
	registerMediabunnyServer({hardwareContext: null});
	const directory = await mkdtemp(join(tmpdir(), 'video-matting-node-'));
	transformersEnvironment.useCustomCache = false;
	transformersEnvironment.useFSCache = true;
	transformersEnvironment.cacheDir = join(directory, 'models');
	try {
		expect(await isVideoMattingModelCached({model: 'modnet'})).toBe(false);
		expect(await downloadVideoMattingModel({model: 'modnet'})).toEqual({
			alreadyDownloaded: false,
		});
		expect(
			await readFile(
				join(directory, 'models/modnet-v1/onnx/model.onnx'),
				'utf8',
			),
		).toBe('https://remotion.media/models/modnet-v1/onnx/model.onnx');
		expect(await downloadVideoMattingModel({model: 'modnet'})).toEqual({
			alreadyDownloaded: true,
		});
		expect(requestedFiles).toHaveLength(2);
		expect(initializationCount).toBe(0);

		const output = new Output({
			format: new WebMOutputFormat(),
			target: new BufferTarget(),
		});
		const video = new VideoSampleSource({
			codec: 'vp9',
			alpha: 'keep',
			bitrate: 1_000_000,
		});
		const audio = new AudioSampleSource({codec: 'opus', bitrate: 64_000});
		output.addVideoTrack(video);
		output.addAudioTrack(audio);
		await output.start();
		for (let i = 0; i < 3; i++) {
			const data = new Uint8Array(32 * 16 * 4);
			for (let j = 0; j < data.length; j += 4) {
				data[j] = 255;
				data[j + 3] = 128;
			}

			using sample = new VideoSample(data, {
				format: 'RGBA',
				codedWidth: 32,
				codedHeight: 16,
				timestamp: i / 10,
				duration: 0.1,
			});
			using sound = new AudioSample({
				format: 'f32',
				sampleRate: 48_000,
				numberOfChannels: 1,
				timestamp: i / 10,
				data: new Float32Array(4800).fill(0.1),
			});
			await Promise.all([video.add(sample), audio.add(sound)]);
		}

		video.close();
		audio.close();
		await output.finalize();
		const src = join(directory, 'input.webm');
		await writeFile(src, new Uint8Array(output.target.buffer!));
		await using modelHandle = await loadVideoMattingModel({model: 'modnet'});
		expect(modelHandle.alreadyLoaded).toBe(false);

		const controller = new AbortController();
		await expect(
			separateVideoLayers({
				src,
				signal: controller.signal,
				onProgress: ({processedFrames}) => {
					if (processedFrames === 1) {
						controller.abort(new Error('stop after first frame'));
					}
				},
			}),
		).rejects.toThrow('stop after first frame');

		await using layers = await separateVideoLayers({
			src: pathToFileURL(src),
			audio: 'both',
			audioBitrate: 'medium',
		});
		expect(layers).toMatchObject({
			width: 32,
			height: 16,
			processedFrames: 3,
			durationInSeconds: 0.3,
		});
		for (const [layer, expectedRed, expectedAlpha] of [
			[layers.base, 128, 255],
			[layers.foreground, 255, 64],
		] as const) {
			using input = new Input({
				formats: ALL_FORMATS,
				source: new BlobSource(await layer.getBlob()),
			});
			const track = (await input.getPrimaryVideoTrack())!;
			expect(await track.getCodec()).toBe('vp9');
			expect(await track.getDisplayWidth()).toBe(32);
			expect(await track.getDisplayHeight()).toBe(16);
			const timestamps: number[] = [];
			for await (const frame of new VideoSampleSink(track).samples()) {
				try {
					const data = new Uint8Array(16 * 32 * 4);
					await frame.copyTo(data, {format: 'RGBA'});
					expect(Math.abs(data[0]! - expectedRed)).toBeLessThan(5);
					expect(Math.abs(data[3]! - expectedAlpha)).toBeLessThan(3);
					timestamps.push(frame.timestamp);
				} finally {
					frame.close();
				}
			}

			expect(timestamps).toEqual([0, 0.1, 0.2]);
			const audioTrack = (await input.getPrimaryAudioTrack())!;
			expect(await audioTrack.getCodec()).toBe('opus');
			using decodedAudio = await new AudioSampleSink(audioTrack).getSample(0);
			expect(decodedAudio!.numberOfFrames).toBeGreaterThan(0);
		}

		await removeVideoMattingModel({model: 'modnet'});
		expect(await isVideoMattingModelCached({model: 'modnet'})).toBe(false);
		expect(livePipelineCount).toBe(0);
	} finally {
		await rm(directory, {recursive: true, force: true});
	}
}, 30_000);

test('an interrupted filesystem download can be retried without leaving partial model files', async () => {
	const {downloadVideoMattingModel} = await import('../index');
	const directory = await mkdtemp(join(tmpdir(), 'video-matting-download-'));
	transformersEnvironment.useCustomCache = false;
	transformersEnvironment.useFSCache = true;
	transformersEnvironment.cacheDir = directory;
	transformersEnvironment.fetch = () =>
		Promise.resolve(
			new Response(
				new ReadableStream({
					start(controller) {
						controller.error(new Error('download interrupted'));
					},
				}),
			),
		);
	try {
		await expect(downloadVideoMattingModel({model: 'modnet'})).rejects.toThrow(
			'download interrupted',
		);
		expect(await readdir(join(directory, 'modnet-v1'))).toEqual([]);
		transformersEnvironment.fetch = originalTransformersEnvironment.fetch;
		expect(await downloadVideoMattingModel({model: 'modnet'})).toEqual({
			alreadyDownloaded: false,
		});
	} finally {
		await rm(directory, {recursive: true, force: true});
	}
});
