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
	env: {backends: {onnx: {wasm: {numThreads: 0}}}},
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
			status: 'progress_total',
			progress: 40,
			loaded: 40,
			total: 100,
		});
		onProgress?.({
			status: 'progress',
			file: 'encoder_model.onnx',
			progress: 90,
			loaded: 90,
			total: 100,
		});
		onProgress?.({
			status: 'progress_total',
			progress: 30,
			loaded: 30,
			total: 100,
		});
		onProgress?.({
			status: 'progress',
			file: 'decoder_model_merged.onnx',
			progress: 10,
			loaded: 10,
			total: 100,
		});
		onProgress?.({
			status: 'progress_total',
			progress: 60,
			loaded: 60,
			total: 100,
		});
		onProgress?.({status: 'done', file: 'encoder_model.onnx'});
		onProgress?.({status: 'ready'});
		return Promise.resolve(fakePipeline);
	},
}));

test('transcribes with timestamps and selects a usable backend', async () => {
	const api = await import('../index');
	const {
		canUseWhisperWebGpu,
		disposeWhisperModel,
		getAvailableModels,
		toCaptions,
		transcribe,
		WhisperWebGpuUnsupportedReason,
	} = api;
	const channelWaveform = new Float32Array(16_000 * 3);
	const result = await transcribe({
		backend: 'wasm',
		channelWaveform,
		language: 'en',
		model: 'small.en',
	});

	expect(pipelineInitialization?.modelId).toBe(
		'onnx-community/whisper-small.en_timestamped',
	);
	expect(pipelineInitialization?.options).toMatchObject({
		device: 'wasm',
		dtype: 'q8',
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
		backend: 'wasm',
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
	expect(models.find((model) => model.name === 'small.en')).toMatchObject({
		parameters: 244_000_000,
		multilingual: false,
		webGpuDownloadSize: 586_209_938,
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
			supported: true,
			backend: 'wasm',
			wasmThreads: 1,
		});
		expect(await canUseWhisperWebGpu({backend: 'webgpu'})).toEqual({
			supported: false,
			reason: WhisperWebGpuUnsupportedReason.WebGpuUnavailable,
			detailedReason: 'No usable WebGPU adapter is available in this browser.',
		});

		const fallbackResult = await transcribe({
			backend: 'auto',
			channelWaveform,
			model: 'base.en',
		});
		expect(fallbackResult.backend).toBe('wasm');
		expect(pipelineInitialization?.options).toMatchObject({
			device: 'wasm',
			dtype: 'q8',
		});

		adapter = {};
		expect(await canUseWhisperWebGpu()).toEqual({
			supported: true,
			backend: 'webgpu',
			wasmThreads: null,
		});
		const webGpuResult = await transcribe({
			backend: 'auto',
			channelWaveform,
			model: 'tiny.en',
		});
		expect(webGpuResult.backend).toBe('webgpu');
		expect(pipelineInitialization?.options).toMatchObject({
			device: 'webgpu',
			dtype: {encoder_model: 'fp32', decoder_model_merged: 'q4'},
		});
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

test('reports aggregate model progress without moving backwards', async () => {
	const {disposeWhisperModel, loadWhisperModel} = await import('../index');
	const progressValues: Array<number | null> = [];
	await loadWhisperModel({
		backend: 'wasm',
		model: 'medium.en',
		onProgress: (progress) => {
			progressValues.push(progress.progress);
		},
	});

	expect(progressValues).toEqual([0, 0.4, 0.4, 0.6, 1]);
	await disposeWhisperModel({backend: 'wasm', model: 'medium.en'});
});
