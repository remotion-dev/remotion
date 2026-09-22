import {beforeEach, expect, mock, test} from 'bun:test';

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

function BackgroundRemovalPipeline() {
	livePipelineCount++;
	return Object.assign(
		() => {
			pipelineRunCount++;
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
	ModelRegistry: {
		is_pipeline_cached_files: () => {
			const files = ['config.json', 'onnx/model.onnx'].map((file) => ({
				file,
				cached: downloadedFiles.has(
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
				checkDownloadedFiles ? downloadedFiles.size === 2 : true,
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
