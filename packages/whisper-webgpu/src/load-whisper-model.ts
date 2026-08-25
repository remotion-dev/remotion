import type {
	ResolvedWhisperWebGpuBackend,
	WhisperWebGpuBackend,
} from './backend';
import {resolveBackend} from './backend';
import {getModelInfo, type WhisperWebGpuModel} from './models';

export type WhisperWebGpuModelLoadProgress = {
	status: string;
	file: string | null;
	progress: number | null;
	loadedBytes: number | null;
	totalBytes: number | null;
};

export type OnWhisperWebGpuModelLoadProgress = (
	progress: WhisperWebGpuModelLoadProgress,
) => void;

type LoadedWhisperPipeline = {
	(audio: Float32Array, options: Record<string, unknown>): Promise<unknown>;
	dispose: () => Promise<void>;
};

const pipelines = new Map<string, Promise<LoadedWhisperPipeline>>();

const getCacheKey = (
	model: WhisperWebGpuModel,
	backend: ResolvedWhisperWebGpuBackend,
) => `${model}:${backend}`;

const normalizeProgress = (
	event: Record<string, unknown>,
): WhisperWebGpuModelLoadProgress => {
	const rawProgress =
		typeof event.progress === 'number' ? event.progress : null;

	return {
		status: typeof event.status === 'string' ? event.status : 'progress',
		file: typeof event.file === 'string' ? event.file : null,
		progress:
			rawProgress === null
				? null
				: Math.max(
						0,
						Math.min(1, rawProgress > 1 ? rawProgress / 100 : rawProgress),
					),
		loadedBytes: typeof event.loaded === 'number' ? event.loaded : null,
		totalBytes: typeof event.total === 'number' ? event.total : null,
	};
};

export type LoadWhisperModelOptions = {
	model: WhisperWebGpuModel;
	backend?: WhisperWebGpuBackend;
	onProgress?: OnWhisperWebGpuModelLoadProgress;
};

export type LoadWhisperModelResult = {
	backend: ResolvedWhisperWebGpuBackend;
	alreadyLoaded: boolean;
};

export const loadWhisperModel = async ({
	model,
	backend = 'auto',
	onProgress,
}: LoadWhisperModelOptions): Promise<LoadWhisperModelResult> => {
	const resolvedBackend = await resolveBackend(backend);
	const cacheKey = getCacheKey(model, resolvedBackend);
	const existing = pipelines.get(cacheKey);
	if (existing) {
		await existing;
		onProgress?.({
			status: 'ready',
			file: null,
			progress: 1,
			loadedBytes: null,
			totalBytes: null,
		});
		return {backend: resolvedBackend, alreadyLoaded: true};
	}

	const {env, pipeline} = await import('@huggingface/transformers');
	if (resolvedBackend === 'wasm') {
		env.backends.onnx.wasm!.numThreads = globalThis.crossOriginIsolated ? 0 : 1;
	}

	const {modelId} = getModelInfo(model);
	const loading = pipeline('automatic-speech-recognition', modelId, {
		device: resolvedBackend,
		dtype:
			resolvedBackend === 'webgpu'
				? {encoder_model: 'fp32', decoder_model_merged: 'q4'}
				: 'q8',
		progress_callback: (event) => {
			onProgress?.(normalizeProgress(event as Record<string, unknown>));
		},
	}) as Promise<LoadedWhisperPipeline>;

	pipelines.set(cacheKey, loading);
	try {
		await loading;
		return {backend: resolvedBackend, alreadyLoaded: false};
	} catch (error) {
		pipelines.delete(cacheKey);
		throw error;
	}
};

export const getLoadedWhisperPipeline = async ({
	model,
	backend,
	onProgress,
}: {
	model: WhisperWebGpuModel;
	backend: WhisperWebGpuBackend;
	onProgress?: OnWhisperWebGpuModelLoadProgress;
}) => {
	const {backend: resolvedBackend} = await loadWhisperModel({
		model,
		backend,
		onProgress,
	});
	const loaded = pipelines.get(getCacheKey(model, resolvedBackend));
	if (!loaded) {
		throw new Error(`Whisper model ${model} was not loaded.`);
	}

	return {pipeline: await loaded, backend: resolvedBackend};
};

export type DisposeWhisperModelOptions = {
	model?: WhisperWebGpuModel;
	backend?: Exclude<WhisperWebGpuBackend, 'auto'>;
};

export const disposeWhisperModel = async ({
	model,
	backend,
}: DisposeWhisperModelOptions = {}): Promise<void> => {
	const matching = [...pipelines.entries()].filter(([key]) => {
		const [loadedModel, loadedBackend] = key.split(':');
		return (
			(model === undefined || loadedModel === model) &&
			(backend === undefined || loadedBackend === backend)
		);
	});

	await Promise.all(
		matching.map(async ([key, loaded]) => {
			pipelines.delete(key);
			const loadedPipeline = await loaded;
			await loadedPipeline.dispose();
		}),
	);
};
