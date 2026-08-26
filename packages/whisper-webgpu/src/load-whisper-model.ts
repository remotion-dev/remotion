import type {
	ResolvedWhisperWebGpuBackend,
	WhisperWebGpuBackend,
} from './backend';
import {resolveBackend} from './backend';
import {
	getModelInfo,
	getWhisperModelDtype,
	type WhisperWebGpuModel,
} from './models';

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
	const modelInfo = getModelInfo(model);
	const totalBytes =
		resolvedBackend === 'webgpu'
			? modelInfo.webGpuDownloadSize
			: modelInfo.wasmDownloadSize;
	const existing = pipelines.get(cacheKey);
	if (existing) {
		await existing;
		onProgress?.({
			status: 'ready',
			file: null,
			progress: 1,
			loadedBytes: totalBytes,
			totalBytes,
		});
		return {backend: resolvedBackend, alreadyLoaded: true};
	}

	const {env, pipeline} = await import('@huggingface/transformers');
	if (resolvedBackend === 'wasm') {
		env.backends.onnx.wasm!.numThreads = globalThis.crossOriginIsolated ? 0 : 1;
	}

	onProgress?.({
		status: 'loading',
		file: null,
		progress: 0,
		loadedBytes: 0,
		totalBytes,
	});

	const {modelId} = modelInfo;
	const loadedByFile = new Map<string, number>();
	let lastProgress = 0;
	let lastLoadedBytes = 0;
	const loading = pipeline('automatic-speech-recognition', modelId, {
		device: resolvedBackend,
		dtype: getWhisperModelDtype(resolvedBackend),
		progress_callback: onProgress
			? (event) => {
					const record = event as Record<string, unknown>;
					if (
						record.status === 'progress' &&
						typeof record.file === 'string' &&
						typeof record.loaded === 'number' &&
						Number.isFinite(record.loaded)
					) {
						loadedByFile.set(
							record.file,
							Math.max(loadedByFile.get(record.file) ?? 0, record.loaded),
						);
						const loadedBytes = [...loadedByFile.values()].reduce(
							(sum, loaded) => sum + loaded,
							0,
						);
						lastProgress = Math.max(
							lastProgress,
							Math.min(loadedBytes / totalBytes, 0.99),
						);
						lastLoadedBytes = Math.max(lastLoadedBytes, loadedBytes);
						onProgress({
							status: 'loading',
							file: null,
							progress: lastProgress,
							loadedBytes: lastLoadedBytes,
							totalBytes,
						});
					}

					if (record.status === 'ready') {
						onProgress({
							status: 'ready',
							file: null,
							progress: 1,
							loadedBytes: Math.max(lastLoadedBytes, totalBytes),
							totalBytes,
						});
					}
				}
			: undefined,
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
