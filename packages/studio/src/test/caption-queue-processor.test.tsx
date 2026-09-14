import {afterEach, expect, mock, test} from 'bun:test';
import {act, cleanup, render, waitFor} from '@testing-library/react';
import {type ContextType, useContext} from 'react';
import {makeBrowserStudioOperations} from './make-browser-studio-operations';

let modelLoadCall:
	| {
			model: string;
	  }
	| undefined;
let transcriptionCall:
	| {
			channelWaveform: Float32Array;
			options: Record<string, unknown>;
	  }
	| undefined;
let cacheCheck:
	| {
			model: string;
	  }
	| undefined;
const getCacheCheck = () => cacheCheck;
const getModelLoadCall = () => modelLoadCall;
let modelIsCached = false;
let modelLoadProgressCallback:
	| ((progress: {
			status: string;
			file: string | null;
			progress: number | null;
			loadedBytes: number | null;
			totalBytes: number | null;
	  }) => void)
	| undefined;
let resolveModelLoading: (() => void) | null = null;
let disposalCalls = 0;
const resamplingCalls: Array<{
	src: string;
	audioStreamIndex: number | null;
	requestInit: Omit<RequestInit, 'signal'> | null;
}> = [];

const resampledWaveform = new Float32Array(32_000).fill(0.25);

mock.module('../components/Transcription/resample-media-to-16-khz', () => ({
	resampleMediaTo16Khz: ({
		src,
		audioStreamIndex,
		requestInit,
		onProgress,
	}: {
		src: string;
		audioStreamIndex: number | null;
		requestInit: Omit<RequestInit, 'signal'> | null;
		onProgress: (progress: number) => void;
	}) => {
		resamplingCalls.push({src, audioStreamIndex, requestInit});
		onProgress(0.5);
		return Promise.resolve(resampledWaveform);
	},
}));

mock.module('@remotion/whisper-webgpu', () => ({
	canUseWhisperWebGpu: () => Promise.resolve({supported: true}),
	clearStaleModels: () => Promise.resolve(),
	disposeWhisperModel: () => {
		disposalCalls++;
		return Promise.resolve();
	},
	getAvailableModels: () => [
		{
			name: 'tiny',
			modelId: 'onnx-community/whisper-tiny_timestamped',
			parameters: 39_000_000,
			multilingual: true,
			supportsTranslation: true,
			webGpuDownloadSize: 119_699_015,
		},
		{
			name: 'tiny.en',
			modelId: 'onnx-community/whisper-tiny.en_timestamped',
			parameters: 39_000_000,
			multilingual: false,
			supportsTranslation: false,
			webGpuDownloadSize: 119_697_479,
		},
		{
			name: 'small.en',
			modelId: 'onnx-community/whisper-small.en_timestamped',
			parameters: 244_000_000,
			multilingual: false,
			supportsTranslation: false,
			webGpuDownloadSize: 614_690_756,
		},
	],
	isWhisperModelCached: ({model}: {model: string}) => {
		cacheCheck = {model};
		return Promise.resolve(modelIsCached);
	},
	loadWhisperModel: async ({
		model,
		onProgress,
	}: {
		model: string;
		onProgress?: typeof modelLoadProgressCallback;
	}) => {
		modelLoadCall = {model};
		modelLoadProgressCallback = onProgress;
		await new Promise<void>((resolve) => {
			resolveModelLoading = resolve;
		});
		modelLoadProgressCallback?.({
			status: 'ready',
			file: null,
			progress: 1,
			loadedBytes: 119_699_015,
			totalBytes: 119_699_015,
		});
		return {alreadyLoaded: false};
	},
	removeWhisperModel: () => Promise.resolve(),
	toCaptions: () => ({
		captions: [
			{
				text: 'Hello',
				startMs: 125,
				endMs: 625,
				timestampMs: 375,
				confidence: null,
			},
			{
				text: ' world.',
				startMs: 750,
				endMs: 1500,
				timestampMs: 1125,
				confidence: null,
			},
		],
	}),
	transcribe: ({
		channelWaveform,
		...options
	}: {
		channelWaveform: Float32Array;
		[key: string]: unknown;
	}) => {
		transcriptionCall = {channelWaveform, options};
		return Promise.resolve({
			text: ' Hello world.',
			chunks: [
				{text: ' Hello', timestamp: [0.125, 0.625]},
				{text: ' world.', timestamp: [0.75, 1.5]},
			],
		});
	},
	WHISPER_WEBGPU_SAMPLE_RATE: 16_000,
}));

afterEach(async () => {
	cleanup();
	resolveModelLoading?.();
	const {disposeWhisperModel} = await import('@remotion/whisper-webgpu');
	await disposeWhisperModel({model: 'tiny'});
	resolveModelLoading = null;
});

test('downloads a model in the queued job before transcribing', async () => {
	disposalCalls = 0;
	resamplingCalls.length = 0;
	modelLoadCall = undefined;
	modelLoadProgressCallback = undefined;
	transcriptionCall = undefined;
	cacheCheck = undefined;
	modelIsCached = false;
	resolveModelLoading = null;
	const {CaptionQueueProcessor} =
		await import('../components/RenderQueue/CaptionQueueProcessor');
	const {RenderQueueContext, RenderQueueContextProvider} =
		await import('../components/RenderQueue/context');
	const originalGpuDescriptor = Object.getOwnPropertyDescriptor(
		navigator,
		'gpu',
	);
	const originalSecureContextDescriptor = Object.getOwnPropertyDescriptor(
		window,
		'isSecureContext',
	);
	const originalBrowserStudioDescriptor = Object.getOwnPropertyDescriptor(
		window,
		'remotion_browserStudio',
	);
	const writtenFiles: Array<{
		contents: string | ArrayBuffer;
		filePath: string;
	}> = [];
	Object.defineProperty(navigator, 'gpu', {
		configurable: true,
		value: {requestAdapter: () => Promise.resolve({})},
	});
	Object.defineProperty(window, 'isSecureContext', {
		configurable: true,
		value: true,
	});
	Object.defineProperty(window, 'remotion_browserStudio', {
		configurable: true,
		value: makeBrowserStudioOperations({
			writeStaticFile: ({contents, filePath}) => {
				writtenFiles.push({contents, filePath});
				return Promise.resolve();
			},
		}),
	});
	let currentContext: ContextType<typeof RenderQueueContext> | null = null;
	const ReadContext = () => {
		currentContext = useContext(RenderQueueContext);
		return null;
	};

	try {
		render(
			<RenderQueueContextProvider>
				<CaptionQueueProcessor />
				<ReadContext />
			</RenderQueueContextProvider>,
		);

		const getContext = () => {
			if (currentContext === null) {
				throw new Error('Render queue context is not mounted');
			}

			return currentContext;
		};

		let jobId = '';
		act(() => {
			jobId = getContext().addCaptionJob({
				displayName: 'interview.wav',
				audioStreamIndex: 2,
				requestInit: {
					credentials: 'include',
					headers: {'x-remotion-test': 'transcription'},
				},
				language: 'de',
				model: 'tiny',
				chunkLengthInSeconds: 20,
				strideLengthInSeconds: 3,
				task: 'translate',
				forceFullSequences: true,
				doSample: true,
				temperature: 0.7,
				topK: 25,
				repetitionPenalty: 1.2,
				noRepeatNgramSize: 3,
				outName: 'captions/interview.json',
				src: '/static/interview.wav',
			});
		});

		await waitFor(() => expect(modelLoadCall).toBeDefined());
		expect(getCacheCheck()).toEqual({model: 'tiny'});
		expect(resamplingCalls).toEqual([]);
		expect(transcriptionCall).toBeUndefined();
		expect(writtenFiles).toEqual([]);

		act(() => {
			modelLoadProgressCallback?.({
				status: 'loading',
				file: null,
				progress: 0.5,
				loadedBytes: 119_699_015 / 2,
				totalBytes: 119_699_015,
			});
		});
		await waitFor(() => {
			const job = getContext().captionJobs.find(({id}) => id === jobId);
			if (job?.status !== 'running') {
				throw new Error('Caption job is not running');
			}

			expect(job.progress.message).toBe('Downloading tiny 50%');
			expect(job.progress.value).toBeCloseTo(0.165);
		});
		expect(resamplingCalls).toEqual([]);
		expect(transcriptionCall).toBeUndefined();
		expect(writtenFiles).toEqual([]);

		act(() => resolveModelLoading?.());
		await waitFor(() => {
			expect(
				getContext().captionJobs.find((job) => job.id === jobId),
			).toMatchObject({status: 'done', captionCount: 2});
		});

		expect(resamplingCalls).toEqual([
			{
				src: '/static/interview.wav',
				audioStreamIndex: 2,
				requestInit: {
					credentials: 'include',
					headers: {'x-remotion-test': 'transcription'},
				},
			},
		]);
		expect(getModelLoadCall()).toEqual({model: 'tiny'});
		await waitFor(() => {
			expect(transcriptionCall).toEqual({
				channelWaveform: resampledWaveform,
				options: {
					model: 'tiny',
					language: 'de',
					task: 'translate',
					chunkLengthInSeconds: 20,
					strideLengthInSeconds: 3,
					forceFullSequences: true,
					doSample: true,
					temperature: 0.7,
					topK: 25,
					repetitionPenalty: 1.2,
					noRepeatNgramSize: 3,
				},
			});
		});
		expect(writtenFiles).toEqual([
			{
				filePath: 'captions/interview.json',
				contents: JSON.stringify(
					[
						{
							text: 'Hello',
							startMs: 125,
							endMs: 625,
							timestampMs: 375,
							confidence: null,
						},
						{
							text: ' world.',
							startMs: 750,
							endMs: 1500,
							timestampMs: 1125,
							confidence: null,
						},
					],
					null,
					2,
				),
			},
		]);
		expect(disposalCalls).toBe(1);
	} finally {
		if (originalGpuDescriptor) {
			Object.defineProperty(navigator, 'gpu', originalGpuDescriptor);
		} else {
			Reflect.deleteProperty(navigator, 'gpu');
		}

		if (originalSecureContextDescriptor) {
			Object.defineProperty(
				window,
				'isSecureContext',
				originalSecureContextDescriptor,
			);
		} else {
			Reflect.deleteProperty(window, 'isSecureContext');
		}

		if (originalBrowserStudioDescriptor) {
			Object.defineProperty(
				window,
				'remotion_browserStudio',
				originalBrowserStudioDescriptor,
			);
		} else {
			Reflect.deleteProperty(window, 'remotion_browserStudio');
		}
	}
});
