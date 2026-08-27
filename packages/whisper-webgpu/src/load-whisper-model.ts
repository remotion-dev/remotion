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

type LoadedWhisperPipelineState = {
	loading: Promise<LoadedWhisperPipeline>;
	activeTranscriptions: number;
	onIdle: Array<() => void>;
};

const pipelines = new Map<WhisperWebGpuModel, LoadedWhisperPipelineState>();

export type LoadWhisperModelOptions = {
	model: WhisperWebGpuModel;
	onProgress?: OnWhisperWebGpuModelLoadProgress;
};

export type LoadWhisperModelResult = {
	alreadyLoaded: boolean;
};

const getOrCreateWhisperPipeline = ({
	model,
	onProgress,
}: LoadWhisperModelOptions): {
	state: LoadedWhisperPipelineState;
	alreadyLoaded: boolean;
	totalBytes: number;
} => {
	const modelInfo = getModelInfo(model);
	const totalBytes = modelInfo.webGpuDownloadSize;
	const existing = pipelines.get(model);
	if (existing) {
		return {state: existing, alreadyLoaded: true, totalBytes};
	}

	const loading = Promise.resolve().then(async () => {
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
		return pipeline('automatic-speech-recognition', modelId, {
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
	});
	const state: LoadedWhisperPipelineState = {
		loading,
		activeTranscriptions: 0,
		onIdle: [],
	};
	pipelines.set(model, state);
	loading.catch(() => {
		if (pipelines.get(model) === state) {
			pipelines.delete(model);
		}
	});

	return {state, alreadyLoaded: false, totalBytes};
};

export const loadWhisperModel = async ({
	model,
	onProgress,
}: LoadWhisperModelOptions): Promise<LoadWhisperModelResult> => {
	const {state, alreadyLoaded, totalBytes} = getOrCreateWhisperPipeline({
		model,
		onProgress,
	});
	await state.loading;
	if (alreadyLoaded) {
		onProgress?.({
			status: 'ready',
			file: null,
			progress: 1,
			loadedBytes: totalBytes,
			totalBytes,
		});
	}

	return {alreadyLoaded};
};

export const withLoadedWhisperPipeline = async <ReturnValue>({
	model,
	onProgress,
	run,
}: {
	model: WhisperWebGpuModel;
	onProgress?: OnWhisperWebGpuModelLoadProgress;
	run: (pipeline: LoadedWhisperPipeline) => Promise<ReturnValue>;
}): Promise<ReturnValue> => {
	const {state, alreadyLoaded, totalBytes} = getOrCreateWhisperPipeline({
		model,
		onProgress,
	});
	state.activeTranscriptions++;
	try {
		const loaded = await state.loading;
		if (alreadyLoaded) {
			onProgress?.({
				status: 'ready',
				file: null,
				progress: 1,
				loadedBytes: totalBytes,
				totalBytes,
			});
		}

		return await run(loaded);
	} finally {
		state.activeTranscriptions--;
		if (state.activeTranscriptions === 0) {
			for (const resolve of state.onIdle.splice(0)) {
				resolve();
			}
		}
	}
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
	for (const [key, state] of matching) {
		if (pipelines.get(key) === state) {
			pipelines.delete(key);
		}
	}

	await Promise.all(
		matching.map(async ([, state]) => {
			const loadedPipeline = await state.loading;
			if (state.activeTranscriptions > 0) {
				await new Promise<void>((resolve) => {
					state.onIdle.push(resolve);
				});
			}

			await loadedPipeline.dispose();
		}),
	);
};
