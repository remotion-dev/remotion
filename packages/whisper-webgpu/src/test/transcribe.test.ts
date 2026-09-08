import {expect, mock, test} from 'bun:test';

let pipelineInitialization:
	| {
			modelId: string;
			options: Record<string, unknown>;
	  }
	| undefined;
let pipelineEnvironment:
	| {
			remoteHost: string;
			remotePathTemplate: string;
	  }
	| undefined;
let pipelineEnvironmentAfterLoading:
	| {
			remoteHost: string;
			remotePathTemplate: string;
	  }
	| undefined;
let transcriptionCall:
	| {
			audio: Float32Array;
			options: Record<string, unknown>;
	  }
	| undefined;
let disposed = false;
let disposeCalls = 0;
let pipelineInitializationCount = 0;
const pipelineInitializationModelIds: string[] = [];
let pipelineInitializationGate: Promise<void> | null = null;
let onPipelineInitializationStarted: (() => void) | null = null;
let transcriptionGate: Promise<void> | null = null;
let onTranscriptionStarted: (() => void) | null = null;
let cacheCheck:
	| {
			task: string;
			modelId: string;
			options: Record<string, unknown>;
	  }
	| undefined;
let cacheCheckEnvironment:
	| {
			remoteHost: string;
			remotePathTemplate: string;
	  }
	| undefined;
let cacheCheckError: Error | null = null;

const originalTransformersEnvironment = {
	remoteHost: 'https://huggingface.co/',
	remotePathTemplate: '{model}/resolve/{revision}/',
};
const transformersEnvironment = {...originalTransformersEnvironment};

const fakePipeline = Object.assign(
	async (audio: Float32Array, options: Record<string, unknown>) => {
		transcriptionCall = {audio, options};
		onTranscriptionStarted?.();
		await transcriptionGate;
		return {
			text: ' Hello world free today.',
			chunks: [
				{text: ' Hello', timestamp: [0.25, 0.75]},
				{text: ' world', timestamp: [1, 1.5]},
				{text: ' free', timestamp: [1.8, 1.7]},
				{text: ' today.', timestamp: [2.2, null]},
			],
		};
	},
	{
		dispose: () => {
			disposed = true;
			disposeCalls++;
			return Promise.resolve();
		},
	},
);

mock.module('@huggingface/transformers', () => ({
	env: transformersEnvironment,
	ModelRegistry: {
		is_pipeline_cached: (
			task: string,
			modelId: string,
			options: Record<string, unknown>,
		) => {
			cacheCheck = {task, modelId, options};
			cacheCheckEnvironment = {...transformersEnvironment};
			if (cacheCheckError) {
				return Promise.reject(cacheCheckError);
			}

			return Promise.resolve(true);
		},
	},
	pipeline: async (
		_task: string,
		modelId: string,
		options: Record<string, unknown>,
	) => {
		pipelineInitializationCount++;
		pipelineInitializationModelIds.push(modelId);
		pipelineInitialization = {modelId, options};
		pipelineEnvironment = {...transformersEnvironment};
		onPipelineInitializationStarted?.();
		await pipelineInitializationGate;
		pipelineEnvironmentAfterLoading = {...transformersEnvironment};
		const onProgress = options.progress_callback as
			| ((progress: Record<string, unknown>) => void)
			| undefined;
		onProgress?.({status: 'initiate', file: 'encoder_model.onnx'});
		onProgress?.({
			status: 'progress',
			file: 'encoder_model.onnx',
			progress: 100,
			loaded: 500_000_000,
			total: 500_000_000,
		});
		onProgress?.({
			status: 'progress_total',
			progress: 100,
			loaded: 500_000_000,
			total: 500_000_000,
		});
		onProgress?.({
			status: 'progress',
			file: 'decoder_model_merged.onnx',
			progress: 20,
			loaded: 100_000_000,
			total: 485_710_974,
		});
		onProgress?.({
			status: 'progress_total',
			progress: 60.87,
			loaded: 600_000_000,
			total: 985_710_974,
		});
		onProgress?.({
			status: 'progress',
			file: 'decoder_model_merged.onnx',
			progress: 100,
			loaded: 485_710_974,
			total: 485_710_974,
		});
		onProgress?.({status: 'done', file: 'encoder_model.onnx'});
		onProgress?.({status: 'ready'});
		return fakePipeline;
	},
}));

test('removes legacy Hugging Face Whisper entries from the shared browser cache', async () => {
	const originalCaches = Object.getOwnPropertyDescriptor(globalThis, 'caches');
	const cacheEnvironment =
		transformersEnvironment as typeof transformersEnvironment & {
			cacheKey: string;
		};
	cacheEnvironment.cacheKey = 'custom-transformers-cache';
	const legacyTiny = new Request(
		'https://huggingface.co/onnx-community/whisper-tiny_timestamped/resolve/main/config.json',
	);
	const legacySmallModel = new Request(
		'https://huggingface.co/onnx-community/whisper-small_timestamped/resolve/main/onnx/encoder_model.onnx',
	);
	const currentTiny = new Request(
		'https://remotion.media/models/whisper-tiny_timestamped-v1/config.json',
	);
	const unrelatedModel = new Request(
		'https://huggingface.co/onnx-community/background-removal/resolve/main/config.json',
	);
	const deleted: string[] = [];
	Object.defineProperty(globalThis, 'caches', {
		configurable: true,
		value: {
			open: (cacheKey: string) => {
				expect(cacheKey).toBe('custom-transformers-cache');
				return Promise.resolve({
					delete: (request: Request) => {
						deleted.push(request.url);
						return Promise.resolve(true);
					},
					keys: () =>
						Promise.resolve([
							legacyTiny,
							legacySmallModel,
							currentTiny,
							unrelatedModel,
						]),
				});
			},
		} as unknown as CacheStorage,
	});

	try {
		const {clearStaleModels} = await import('../index');
		await clearStaleModels();
		expect(deleted).toEqual([legacyTiny.url, legacySmallModel.url]);
	} finally {
		Reflect.deleteProperty(cacheEnvironment, 'cacheKey');
		if (originalCaches) {
			Object.defineProperty(globalThis, 'caches', originalCaches);
		} else {
			Reflect.deleteProperty(globalThis, 'caches');
		}
	}
});

test('transcribes with word timestamps using WebGPU', async () => {
	const api = await import('../index');
	const {
		canUseWhisperWebGpu,
		clearStaleModels,
		disposeWhisperModel,
		getAvailableModels,
		isWhisperModelCached,
		toCaptions,
		transcribe,
		WhisperWebGpuUnsupportedReason,
	} = api;
	await expect(clearStaleModels()).resolves.toBeUndefined();
	const channelWaveform = new Float32Array(16_000 * 3);
	const result = await transcribe({
		channelWaveform,
		language: 'en',
		model: 'small.en',
	});

	expect(pipelineInitialization?.modelId).toBe(
		'whisper-small.en_timestamped-v1',
	);
	expect(pipelineEnvironment).toEqual({
		remoteHost: 'https://remotion.media/',
		remotePathTemplate: 'models/{model}/',
	});
	expect(pipelineEnvironmentAfterLoading).toEqual(pipelineEnvironment);
	expect(pipelineInitialization?.options).toMatchObject({
		device: 'webgpu',
		dtype: {encoder_model: 'fp32', decoder_model_merged: 'q4'},
	});
	expect(transcriptionCall?.audio).toBe(channelWaveform);
	expect(transcriptionCall?.options).toEqual({
		return_timestamps: 'word',
		chunk_length_s: 30,
		stride_length_s: 5,
		force_full_sequences: false,
		do_sample: false,
		temperature: 1,
		top_k: 50,
		repetition_penalty: 1,
		no_repeat_ngram_size: 0,
	});
	expect(result).toEqual({
		text: 'Hello world free today.',
		model: 'small.en',
		words: [
			{text: 'Hello', startInSeconds: 0.25, endInSeconds: 0.75},
			{text: ' world', startInSeconds: 1, endInSeconds: 1.5},
			{text: ' free', startInSeconds: 1.8, endInSeconds: 2.2},
			{text: ' today.', startInSeconds: 2.2, endInSeconds: 3},
		],
	});

	expect(toCaptions({whisperWebGpuOutput: result})).toEqual({
		captions: [
			{
				text: 'Hello',
				startMs: 250,
				endMs: 750,
				timestampMs: 500,
				confidence: null,
			},
			{
				text: ' world',
				startMs: 1000,
				endMs: 1500,
				timestampMs: 1250,
				confidence: null,
			},
			{
				text: ' free',
				startMs: 1800,
				endMs: 2200,
				timestampMs: 2000,
				confidence: null,
			},
			{
				text: ' today.',
				startMs: 2200,
				endMs: 3000,
				timestampMs: 2600,
				confidence: null,
			},
		],
	});

	const models = getAvailableModels();
	expect(models.map((model) => model.name)).toEqual([
		'tiny',
		'tiny.en',
		'base',
		'base.en',
		'small',
		'small.en',
		'medium',
		'medium.en',
		'large-v3-turbo',
	]);
	expect(models.find((model) => model.name === 'small.en')).toEqual({
		name: 'small.en',
		modelId: 'onnx-community/whisper-small.en_timestamped',
		parameters: 244_000_000,
		multilingual: false,
		supportsTranslation: false,
		webGpuDownloadSize: 586_209_938,
	});
	expect(models.find((model) => model.name === 'large-v3-turbo')).toMatchObject(
		{
			multilingual: true,
			supportsTranslation: false,
		},
	);
	expect(await isWhisperModelCached({model: 'small.en'})).toBe(true);
	expect(cacheCheck).toEqual({
		task: 'automatic-speech-recognition',
		modelId: 'whisper-small.en_timestamped-v1',
		options: {
			device: 'webgpu',
			dtype: {encoder_model: 'fp32', decoder_model_merged: 'q4'},
		},
	});
	expect(cacheCheckEnvironment).toEqual({
		remoteHost: 'https://remotion.media/',
		remotePathTemplate: 'models/{model}/',
	});
	expect(transformersEnvironment).toEqual(originalTransformersEnvironment);

	const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
	const originalNavigator = Object.getOwnPropertyDescriptor(
		globalThis,
		'navigator',
	);
	let adapter: object | null = null;
	Object.defineProperty(globalThis, 'window', {
		configurable: true,
		value: {
			crossOriginIsolated: false,
			isSecureContext: true,
		},
	});
	Object.defineProperty(globalThis, 'navigator', {
		configurable: true,
		value: {
			gpu: {
				requestAdapter: () => Promise.resolve(adapter),
			},
			hardwareConcurrency: 8,
		},
	});

	try {
		expect(await canUseWhisperWebGpu()).toEqual({
			supported: false,
			reason: WhisperWebGpuUnsupportedReason.WebGpuUnavailable,
			detailedReason: 'No usable WebGPU adapter is available in this browser.',
		});

		adapter = {};
		expect(await canUseWhisperWebGpu()).toEqual({supported: true});
	} finally {
		if (originalWindow) {
			Object.defineProperty(globalThis, 'window', originalWindow);
		} else {
			delete (globalThis as {window?: unknown}).window;
		}

		if (originalNavigator) {
			Object.defineProperty(globalThis, 'navigator', originalNavigator);
		} else {
			delete (globalThis as {navigator?: unknown}).navigator;
		}
	}

	await disposeWhisperModel();
	expect(disposed).toBe(true);
});

test('loads every public model from its explicit immutable hosted path', async () => {
	const {disposeWhisperModel, getAvailableModels, loadWhisperModel} =
		await import('../index');
	const models = getAvailableModels();
	const initializationsBeforeLoading = pipelineInitializationModelIds.length;

	for (const model of models) {
		await loadWhisperModel({model: model.name});
		await disposeWhisperModel({model: model.name});
	}

	expect(
		pipelineInitializationModelIds.slice(initializationsBeforeLoading),
	).toEqual([
		'whisper-tiny_timestamped-v1',
		'whisper-tiny.en_timestamped-v1',
		'whisper-base_timestamped-v1',
		'whisper-base.en_timestamped-v1',
		'whisper-small_timestamped-v1',
		'whisper-small.en_timestamped-v1',
		'whisper-medium_timestamped-v1',
		'whisper-medium.en_timestamped-v1',
		'whisper-large-v3-turbo_timestamped-v1',
	]);
	expect(models.map(({modelId}) => modelId)).toEqual([
		'onnx-community/whisper-tiny_timestamped',
		'onnx-community/whisper-tiny.en_timestamped',
		'onnx-community/whisper-base_timestamped',
		'onnx-community/whisper-base.en_timestamped',
		'onnx-community/whisper-small_timestamped',
		'onnx-community/whisper-small.en_timestamped',
		'onnx-community/whisper-medium_timestamped',
		'onnx-community/whisper-medium.en_timestamped',
		'onnx-community/whisper-large-v3-turbo_timestamped',
	]);
	expect(transformersEnvironment).toEqual(originalTransformersEnvironment);
});

test('restores the Transformers environment if a hosted model operation fails', async () => {
	const {isWhisperModelCached} = await import('../index');
	cacheCheckError = new Error('Could not read the model cache');
	try {
		await expect(isWhisperModelCached({model: 'tiny'})).rejects.toThrow(
			'Could not read the model cache',
		);
		expect(transformersEnvironment).toEqual(originalTransformersEnvironment);
	} finally {
		cacheCheckError = null;
	}
});

test('reports model progress without reaching 100% before every file loads', async () => {
	const {disposeWhisperModel, loadWhisperModel} = await import('../index');
	const progressValues: Array<{
		progress: number | null;
		loadedBytes: number | null;
		totalBytes: number | null;
	}> = [];
	await loadWhisperModel({
		model: 'medium.en',
		onProgress: (progress) => {
			progressValues.push({
				progress: progress.progress,
				loadedBytes: progress.loadedBytes,
				totalBytes: progress.totalBytes,
			});
		},
	});

	expect(progressValues[0]).toEqual({
		progress: 0,
		loadedBytes: 0,
		totalBytes: 1_698_504_047,
	});
	expect(progressValues.at(-1)).toEqual({
		progress: 1,
		loadedBytes: 1_698_504_047,
		totalBytes: 1_698_504_047,
	});
	const downloading = progressValues.slice(0, -1);
	expect(
		downloading.every(({progress}) => progress !== null && progress < 1),
	).toBe(true);
	expect(downloading.map(({loadedBytes}) => loadedBytes)).toEqual([
		0, 500_000_000, 600_000_000, 985_710_974,
	]);
	expect(downloading.map(({progress}) => progress)).toEqual(
		[0, 500_000_000, 600_000_000, 985_710_974].map((loaded) =>
			Math.min(loaded / 1_698_504_047, 0.99),
		),
	);
	await disposeWhisperModel({model: 'medium.en'});
});

test('validates and forwards transcription settings through transcribe()', async () => {
	const {disposeWhisperModel, transcribe} = await import('../index');
	const channelWaveform = new Float32Array(16_000);

	await expect(
		transcribe({channelWaveform, model: 'tiny', language: 'auto'}),
	).rejects.toThrow(
		'The language option is required for the multilingual model "tiny" because automatic language detection is not supported.',
	);
	await expect(
		transcribe({channelWaveform, model: 'tiny.en', language: 'de'}),
	).rejects.toThrow(
		'The English-only model "tiny.en" does not support the language "de".',
	);
	await expect(
		transcribe({
			channelWaveform,
			model: 'tiny.en',
			task: 'translate',
		}),
	).rejects.toThrow('does not support translation');
	await expect(
		transcribe({
			channelWaveform,
			language: 'en',
			model: 'large-v3-turbo',
			task: 'translate',
		}),
	).rejects.toThrow('does not support translation');
	await expect(
		transcribe({
			channelWaveform,
			model: 'tiny.en',
			chunkLengthInSeconds: Number.NaN,
		}),
	).rejects.toThrow(
		'chunkLengthInSeconds must be a finite number greater than 0.',
	);
	await expect(
		transcribe({
			channelWaveform,
			model: 'tiny.en',
			strideLengthInSeconds: Number.NaN,
		}),
	).rejects.toThrow(
		'strideLengthInSeconds must be a finite, non-negative number and less than half of chunkLengthInSeconds.',
	);

	const invalidOptions: Array<{
		options: Record<string, unknown>;
		optionName: string;
	}> = [
		{options: {forceFullSequences: 'yes'}, optionName: 'forceFullSequences'},
		{options: {doSample: 'yes'}, optionName: 'doSample'},
		{options: {temperature: Number.NaN}, optionName: 'temperature'},
		{options: {temperature: 0}, optionName: 'temperature'},
		{options: {topK: Number.NaN}, optionName: 'topK'},
		{options: {topK: -1}, optionName: 'topK'},
		{options: {topK: 1.5}, optionName: 'topK'},
		{options: {repetitionPenalty: Number.NaN}, optionName: 'repetitionPenalty'},
		{options: {repetitionPenalty: 0}, optionName: 'repetitionPenalty'},
		{options: {noRepeatNgramSize: Number.NaN}, optionName: 'noRepeatNgramSize'},
		{options: {noRepeatNgramSize: -1}, optionName: 'noRepeatNgramSize'},
		{options: {noRepeatNgramSize: 1.5}, optionName: 'noRepeatNgramSize'},
		{options: {task: 'summarize'}, optionName: 'task'},
	];

	for (const {options, optionName} of invalidOptions) {
		await expect(
			transcribe({
				channelWaveform,
				model: 'tiny.en',
				...options,
			} as never),
		).rejects.toThrow(optionName);
	}

	await transcribe({
		channelWaveform,
		model: 'tiny',
		language: 'de',
		task: 'translate',
		forceFullSequences: true,
		doSample: true,
		temperature: 0.7,
		topK: 25,
		repetitionPenalty: 1.2,
		noRepeatNgramSize: 3,
	});
	expect(transcriptionCall?.options).toEqual({
		return_timestamps: 'word',
		chunk_length_s: 30,
		stride_length_s: 5,
		language: 'de',
		task: 'translate',
		force_full_sequences: true,
		do_sample: true,
		temperature: 0.7,
		top_k: 25,
		repetition_penalty: 1.2,
		no_repeat_ngram_size: 3,
	});
	await disposeWhisperModel({model: 'tiny'});
});

test('shares concurrent initialization and keeps the model host scoped until every operation completes', async () => {
	const {disposeWhisperModel, isWhisperModelCached, loadWhisperModel} =
		await import('../index');
	let releaseInitialization: () => void = () => {};
	pipelineInitializationGate = new Promise<void>((resolve) => {
		releaseInitialization = resolve;
	});
	const initializationStarted = new Promise<void>((resolve) => {
		onPipelineInitializationStarted = resolve;
	});
	const initializationsBeforeLoading = pipelineInitializationCount;
	const disposalsBeforeLoading = disposeCalls;

	const firstLoad = loadWhisperModel({model: 'base'});
	const secondLoad = loadWhisperModel({model: 'base'});
	await initializationStarted;
	expect(pipelineInitializationCount - initializationsBeforeLoading).toBe(1);
	expect(transformersEnvironment).toEqual({
		remoteHost: 'https://remotion.media/',
		remotePathTemplate: 'models/{model}/',
	});
	expect(
		(
			transformersEnvironment as typeof transformersEnvironment &
				Record<symbol, unknown>
		)[Symbol.for('@remotion/whisper-webgpu/model-host-state')],
	).toMatchObject({
		activeOperations: 1,
		previousRemoteConfiguration: originalTransformersEnvironment,
	});
	await expect(isWhisperModelCached({model: 'tiny.en'})).resolves.toBe(true);
	expect(cacheCheck).toMatchObject({
		modelId: 'whisper-tiny.en_timestamped-v1',
	});
	expect(transformersEnvironment).toEqual({
		remoteHost: 'https://remotion.media/',
		remotePathTemplate: 'models/{model}/',
	});
	const disposal = disposeWhisperModel({model: 'base'});
	await Promise.resolve();
	expect(disposeCalls).toBe(disposalsBeforeLoading);

	releaseInitialization();
	await expect(Promise.all([firstLoad, secondLoad])).resolves.toEqual([
		{alreadyLoaded: false},
		{alreadyLoaded: true},
	]);
	await disposal;
	expect(disposeCalls).toBe(disposalsBeforeLoading + 1);
	expect(transformersEnvironment).toEqual(originalTransformersEnvironment);
	pipelineInitializationGate = null;
	onPipelineInitializationStarted = null;
});

test('only restores Transformers environment fields left unchanged by the consumer', async () => {
	const {disposeWhisperModel, loadWhisperModel} = await import('../index');
	let releaseInitialization: () => void = () => {};
	pipelineInitializationGate = new Promise<void>((resolve) => {
		releaseInitialization = resolve;
	});
	const initializationStarted = new Promise<void>((resolve) => {
		onPipelineInitializationStarted = resolve;
	});
	const loading = loadWhisperModel({model: 'small'});

	try {
		await initializationStarted;
		transformersEnvironment.remoteHost = 'https://models.example.com/';
		releaseInitialization();
		await loading;
		expect(transformersEnvironment).toEqual({
			remoteHost: 'https://models.example.com/',
			remotePathTemplate: '{model}/resolve/{revision}/',
		});
		await disposeWhisperModel({model: 'small'});
	} finally {
		releaseInitialization();
		pipelineInitializationGate = null;
		onPipelineInitializationStarted = null;
		Object.assign(transformersEnvironment, originalTransformersEnvironment);
	}
});

test('waits for active transcriptions before disposal', async () => {
	const {disposeWhisperModel, transcribe} = await import('../index');
	let releaseTranscription: () => void = () => {};
	transcriptionGate = new Promise<void>((resolve) => {
		releaseTranscription = resolve;
	});
	const transcriptionStarted = new Promise<void>((resolve) => {
		onTranscriptionStarted = resolve;
	});
	const disposalsBeforeTranscription = disposeCalls;

	const transcription = transcribe({
		channelWaveform: new Float32Array(16_000),
		model: 'base.en',
	});
	await transcriptionStarted;
	const disposal = disposeWhisperModel({model: 'base.en'});
	await Promise.resolve();
	expect(disposeCalls).toBe(disposalsBeforeTranscription);

	releaseTranscription();
	await expect(transcription).resolves.toMatchObject({model: 'base.en'});
	await disposal;
	expect(disposeCalls).toBe(disposalsBeforeTranscription + 1);
	transcriptionGate = null;
	onTranscriptionStarted = null;
});
