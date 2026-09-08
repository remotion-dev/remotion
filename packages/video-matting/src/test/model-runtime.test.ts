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
let cacheCheckEnvironment:
	| {remoteHost: string; remotePathTemplate: string}
	| undefined;

const originalTransformersEnvironment = {
	remoteHost: 'https://huggingface.co/',
	remotePathTemplate: '{model}/resolve/{revision}/',
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
			initializationEnvironment = {...transformersEnvironment};
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
		is_pipeline_cached: (
			task: string,
			modelId: string,
			options: Record<string, unknown>,
		) => {
			cacheCheck = {task, modelId, options};
			cacheCheckEnvironment = {...transformersEnvironment};
			return Promise.resolve(true);
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
	cacheCheckEnvironment = undefined;
	preexistingWhisperModelHostState.activeOperations = 0;
	preexistingWhisperModelHostState.previousRemoteConfiguration = null;
	Object.assign(transformersEnvironment, originalTransformersEnvironment);
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
	expect(await Promise.all([first, second])).toEqual([
		{alreadyLoaded: false},
		{alreadyLoaded: true},
	]);
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
	expect(await Promise.all(loads)).toEqual([
		{alreadyLoaded: false},
		{alreadyLoaded: false},
	]);
	expect(transformersEnvironment).toEqual(originalTransformersEnvironment);
	await disposeVideoMattingModel();
});
