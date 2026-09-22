import './symbol-async-dispose';
import {
	getHostedModelId,
	getModelInfo,
	getWhisperWebGpuDtype,
	type WhisperWebGpuModel,
} from './models';
import {withRemotionModelHost} from './with-remotion-model-host';

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
	progressListeners: Set<OnWhisperWebGpuModelLoadProgress>;
	latestProgress: WhisperWebGpuModelLoadProgress | null;
	retainedLoadHandles: number;
};

const pipelines = new Map<WhisperWebGpuModel, LoadedWhisperPipelineState>();

export type LoadWhisperModelOptions = {
	model: WhisperWebGpuModel;
	onProgress?: OnWhisperWebGpuModelLoadProgress;
	signal?: AbortSignal;
};

export type LoadWhisperModelResult = AsyncDisposable & {
	alreadyLoaded: boolean;
};

const getOrCreateWhisperPipeline = ({
	model,
	onProgress,
}: LoadWhisperModelOptions): {
	state: LoadedWhisperPipelineState;
	alreadyLoaded: boolean;
	unsubscribe: () => void;
} => {
	if (!getModelInfo(model)) {
		throw new Error(`Unsupported Whisper model "${model}".`);
	}

	const existing = pipelines.get(model);
	if (existing) {
		if (onProgress) {
			existing.progressListeners.add(onProgress);
			if (existing.latestProgress) {
				onProgress(existing.latestProgress);
			}
		}

		return {
			state: existing,
			alreadyLoaded: true,
			unsubscribe: () => {
				if (onProgress) {
					existing.progressListeners.delete(onProgress);
				}
			},
		};
	}

	const progressListeners = new Set<OnWhisperWebGpuModelLoadProgress>();
	if (onProgress) {
		progressListeners.add(onProgress);
	}

	const state: LoadedWhisperPipelineState = {
		loading: Promise.resolve(null as never),
		activeTranscriptions: 0,
		onIdle: [],
		progressListeners,
		latestProgress: null,
		retainedLoadHandles: 0,
	};
	const emitProgress = (progress: WhisperWebGpuModelLoadProgress) => {
		state.latestProgress = progress;
		for (const listener of state.progressListeners) {
			listener(progress);
		}
	};

	const loading = Promise.resolve().then(() => {
		return withRemotionModelHost(async ({ModelRegistry, pipeline}) => {
			const hostedModelId = getHostedModelId(model);
			if (
				!(await ModelRegistry.is_pipeline_cached(
					'automatic-speech-recognition',
					hostedModelId,
					{device: 'webgpu', dtype: getWhisperWebGpuDtype(model)},
				))
			) {
				throw new Error(
					`The Whisper model "${model}" is not downloaded. Call downloadWhisperModel() first.`,
				);
			}

			emitProgress({
				status: 'initializing',
				file: null,
				progress: null,
				loadedBytes: null,
				totalBytes: null,
			});

			return pipeline('automatic-speech-recognition', hostedModelId, {
				device: 'webgpu',
				dtype: getWhisperWebGpuDtype(model),
				progress_callback: (event) => {
					const record = event as Record<string, unknown>;
					if (record.status === 'ready') {
						emitProgress({
							status: 'ready',
							file: null,
							progress: 1,
							loadedBytes: null,
							totalBytes: null,
						});
					}
				},
			}) as Promise<LoadedWhisperPipeline>;
		});
	});
	state.loading = loading;
	pipelines.set(model, state);
	loading.catch(() => {
		if (pipelines.get(model) === state) {
			pipelines.delete(model);
		}
	});

	return {
		state,
		alreadyLoaded: false,
		unsubscribe: () => {
			if (onProgress) {
				state.progressListeners.delete(onProgress);
			}
		},
	};
};

const disposeWhisperPipelineState = async ({
	model,
	state,
}: {
	model: WhisperWebGpuModel;
	state: LoadedWhisperPipelineState;
}): Promise<void> => {
	if (pipelines.get(model) !== state) {
		return;
	}

	pipelines.delete(model);
	const loadedPipeline = await state.loading;
	if (state.activeTranscriptions > 0) {
		await new Promise<void>((resolve) => {
			state.onIdle.push(resolve);
		});
	}

	await loadedPipeline.dispose();
};

export const loadWhisperModel = async ({
	model,
	onProgress,
	signal,
}: LoadWhisperModelOptions): Promise<LoadWhisperModelResult> => {
	signal?.throwIfAborted();
	const {state, alreadyLoaded, unsubscribe} = getOrCreateWhisperPipeline({
		model,
		onProgress: (progress) => {
			if (!signal?.aborted) {
				onProgress?.(progress);
			}
		},
	});
	state.retainedLoadHandles++;
	try {
		await state.loading;
		signal?.throwIfAborted();
	} catch (error) {
		state.retainedLoadHandles--;
		if (state.retainedLoadHandles === 0 && state.activeTranscriptions === 0) {
			await disposeWhisperPipelineState({model, state}).catch(
				(disposeError) => {
					signal?.throwIfAborted();
					throw disposeError;
				},
			);
		}

		signal?.throwIfAborted();
		throw error;
	} finally {
		unsubscribe();
	}

	let released = false;
	const result = {alreadyLoaded} as LoadWhisperModelResult;
	Object.defineProperty(result, Symbol.asyncDispose, {
		enumerable: false,
		value: async () => {
			if (released) {
				return;
			}

			released = true;
			state.retainedLoadHandles--;
			if (state.retainedLoadHandles === 0) {
				await disposeWhisperPipelineState({model, state});
			}
		},
	});
	return result;
};

export const withLoadedWhisperPipeline = async <ReturnValue>({
	model,
	onProgress,
	signal,
	run,
}: {
	model: WhisperWebGpuModel;
	onProgress?: OnWhisperWebGpuModelLoadProgress;
	signal: AbortSignal | null;
	run: (pipeline: LoadedWhisperPipeline) => Promise<ReturnValue>;
}): Promise<ReturnValue> => {
	signal?.throwIfAborted();
	const {state, unsubscribe} = getOrCreateWhisperPipeline({
		model,
		onProgress,
	});
	state.activeTranscriptions++;
	try {
		const loaded = await state.loading;
		unsubscribe();
		signal?.throwIfAborted();
		return await run(loaded);
	} catch (error) {
		signal?.throwIfAborted();
		throw error;
	} finally {
		unsubscribe();
		state.activeTranscriptions--;
		if (state.activeTranscriptions === 0) {
			for (const resolve of state.onIdle.splice(0)) {
				resolve();
			}

			if (signal?.aborted && state.retainedLoadHandles === 0) {
				await disposeWhisperPipelineState({model, state}).catch(() => {
					signal.throwIfAborted();
				});
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
	await Promise.all(
		matching.map(([key, state]) => {
			return disposeWhisperPipelineState({model: key, state});
		}),
	);
};
