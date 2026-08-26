import {expect, mock, test} from 'bun:test';

let pipelineInitialization:
	| {
			modelId: string;
			options: Record<string, unknown>;
	  }
	| undefined;
let transcriptionCall:
	| {
			audio: Float32Array;
			options: Record<string, unknown>;
	  }
	| undefined;
let disposed = false;
let cacheCheck:
	| {
			task: string;
			modelId: string;
			options: Record<string, unknown>;
	  }
	| undefined;

const fakePipeline = Object.assign(
	(audio: Float32Array, options: Record<string, unknown>) => {
		transcriptionCall = {audio, options};
		return Promise.resolve({
			text: ' Hello world free today.',
			chunks: [
				{text: ' Hello', timestamp: [0.25, 0.75]},
				{text: ' world', timestamp: [1, 1.5]},
				{text: ' free', timestamp: [1.8, 1.7]},
				{text: ' today.', timestamp: [2.2, null]},
			],
		});
	},
	{
		dispose: () => {
			disposed = true;
			return Promise.resolve();
		},
	},
);

mock.module('@huggingface/transformers', () => ({
	ModelRegistry: {
		is_pipeline_cached: (
			task: string,
			modelId: string,
			options: Record<string, unknown>,
		) => {
			cacheCheck = {task, modelId, options};
			return Promise.resolve(true);
		},
	},
	pipeline: (
		_task: string,
		modelId: string,
		options: Record<string, unknown>,
	) => {
		pipelineInitialization = {modelId, options};
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
		return Promise.resolve(fakePipeline);
	},
}));

test('transcribes with word timestamps using WebGPU', async () => {
	const api = await import('../index');
	const {
		canUseWhisperWebGpu,
		disposeWhisperModel,
		getAvailableModels,
		isWhisperModelCached,
		toCaptions,
		transcribe,
		WhisperWebGpuUnsupportedReason,
	} = api;
	const channelWaveform = new Float32Array(16_000 * 3);
	const result = await transcribe({
		channelWaveform,
		language: 'en',
		model: 'small.en',
	});

	expect(pipelineInitialization?.modelId).toBe(
		'onnx-community/whisper-small.en_timestamped',
	);
	expect(pipelineInitialization?.options).toMatchObject({
		device: 'webgpu',
		dtype: {encoder_model: 'fp32', decoder_model_merged: 'q4'},
	});
	expect(transcriptionCall?.audio).toBe(channelWaveform);
	expect(transcriptionCall?.options).toMatchObject({
		return_timestamps: 'word',
		chunk_length_s: 30,
		stride_length_s: 5,
		language: 'en',
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
		webGpuDownloadSize: 586_209_938,
	});
	expect(await isWhisperModelCached({model: 'small.en'})).toBe(true);
	expect(cacheCheck).toEqual({
		task: 'automatic-speech-recognition',
		modelId: 'onnx-community/whisper-small.en_timestamped',
		options: {
			device: 'webgpu',
			dtype: {encoder_model: 'fp32', decoder_model_merged: 'q4'},
		},
	});

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
