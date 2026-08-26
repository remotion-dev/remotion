import {
	getModelInfo,
	WHISPER_WEBGPU_DTYPE,
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

const pipelines = new Map<WhisperWebGpuModel, Promise<LoadedWhisperPipeline>>();

export type LoadWhisperModelOptions = {
	model: WhisperWebGpuModel;
	onProgress?: OnWhisperWebGpuModelLoadProgress;
};

export type LoadWhisperModelResult = {
	alreadyLoaded: boolean;
};

export const loadWhisperModel = async ({
	model,
	onProgress,
}: LoadWhisperModelOptions): Promise<LoadWhisperModelResult> => {
	const modelInfo = getModelInfo(model);
	const totalBytes = modelInfo.webGpuDownloadSize;
	const existing = pipelines.get(model);
	if (existing) {
		await existing;
		onProgress?.({
			status: 'ready',
			file: null,
			progress: 1,
			loadedBytes: totalBytes,
			totalBytes,
		});
		return {alreadyLoaded: true};
	}

	const {pipeline} = await import('@huggingface/transformers');

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
		device: 'webgpu',
		dtype: WHISPER_WEBGPU_DTYPE,
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

	pipelines.set(model, loading);
	try {
		await loading;
		return {alreadyLoaded: false};
	} catch (error) {
		pipelines.delete(model);
		throw error;
	}
};

export const getLoadedWhisperPipeline = async ({
	model,
	onProgress,
}: {
	model: WhisperWebGpuModel;
	onProgress?: OnWhisperWebGpuModelLoadProgress;
}) => {
	await loadWhisperModel({
		model,
		onProgress,
	});
	const loaded = pipelines.get(model);
	if (!loaded) {
		throw new Error(`Whisper model ${model} was not loaded.`);
	}

	return loaded;
};

export type DisposeWhisperModelOptions = {
	model?: WhisperWebGpuModel;
};

export const disposeWhisperModel = async ({
	model,
}: DisposeWhisperModelOptions = {}): Promise<void> => {
	const matching = [...pipelines.entries()].filter(([loadedModel]) => {
		return model === undefined || loadedModel === model;
	});

	await Promise.all(
		matching.map(async ([key, loaded]) => {
			pipelines.delete(key);
			const loadedPipeline = await loaded;
			await loadedPipeline.dispose();
		}),
	);
};
