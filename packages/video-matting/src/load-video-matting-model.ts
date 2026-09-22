import {
	getHostedVideoMattingModelId,
	getVideoMattingModelInfo,
	type VideoMattingModel,
} from './models';
import {withRemotionModelHost} from './with-remotion-model-host';

export type VideoMattingModelLoadProgress = {
	status: string;
	file: string | null;
	progress: number | null;
	loadedBytes: number | null;
	totalBytes: number | null;
};

export type OnVideoMattingModelLoadProgress = (
	progress: VideoMattingModelLoadProgress,
) => void;

export type VideoMattingImageSource = HTMLCanvasElement | OffscreenCanvas;

export type VideoMattingPipelineResult = {
	data: Uint8ClampedArray<ArrayBuffer>;
	width: number;
	height: number;
	channels: 4;
};

export type LoadedVideoMattingPipeline = (
	image: VideoMattingImageSource,
) => Promise<VideoMattingPipelineResult>;

type TransformerPipelineResult = {
	data: Uint8Array | Uint8ClampedArray;
	width: number;
	height: number;
	channels: number;
};

type TransformerPipeline = {
	(image: VideoMattingImageSource): Promise<TransformerPipelineResult>;
	dispose: () => Promise<void>;
};

type LoadedPipeline = {
	run: LoadedVideoMattingPipeline;
	dispose: () => Promise<void>;
};

type LoadedVideoMattingPipelineState = {
	loading: Promise<LoadedPipeline>;
	pendingUses: number;
	activeUses: number;
	onIdle: Array<() => void>;
	progressListeners: Set<OnVideoMattingModelLoadProgress>;
	lastProgress: VideoMattingModelLoadProgress | null;
};

const pipelines = new Map<VideoMattingModel, LoadedVideoMattingPipelineState>();
const disposals = new Map<VideoMattingModel, Promise<void>>();

export type LoadVideoMattingModelOptions = {
	model: VideoMattingModel;
	onProgress?: OnVideoMattingModelLoadProgress;
};

export type LoadVideoMattingModelResult = {
	alreadyLoaded: boolean;
};

const notifyProgress = (
	state: LoadedVideoMattingPipelineState,
	progress: VideoMattingModelLoadProgress,
) => {
	state.lastProgress = progress;
	for (const listener of state.progressListeners) {
		try {
			listener(progress);
		} catch {
			// Progress callbacks are observers and must not affect shared loading.
		}
	}
};

const notifyIfIdle = (state: LoadedVideoMattingPipelineState) => {
	if (state.pendingUses === 0 && state.activeUses === 0) {
		for (const resolve of state.onIdle.splice(0)) {
			resolve();
		}
	}
};

const waitForLoadingOrAbort = <Value>({
	loading,
	signal,
}: {
	loading: Promise<Value>;
	signal: AbortSignal | null;
}): Promise<Value> => {
	if (signal === null) {
		return loading;
	}

	if (signal.aborted) {
		return Promise.reject(signal.reason);
	}

	return new Promise<Value>((resolve, reject) => {
		const onAbort = () => {
			signal.removeEventListener('abort', onAbort);
			reject(signal.reason);
		};

		signal.addEventListener('abort', onAbort, {once: true});

		loading.then(
			(value) => {
				signal.removeEventListener('abort', onAbort);
				resolve(value);
			},
			(error) => {
				signal.removeEventListener('abort', onAbort);
				reject(error);
			},
		);
	});
};

const getOrCreateVideoMattingPipeline = ({
	model,
}: {
	model: VideoMattingModel;
}): {
	state: LoadedVideoMattingPipelineState;
	alreadyLoaded: boolean;
} => {
	const modelInfo = getVideoMattingModelInfo(model);
	const existing = pipelines.get(model);
	if (existing) {
		return {state: existing, alreadyLoaded: true};
	}

	const state: LoadedVideoMattingPipelineState = {
		loading: Promise.resolve(null as never),
		pendingUses: 0,
		activeUses: 0,
		onIdle: [],
		progressListeners: new Set(),
		lastProgress: null,
	};
	const pendingDisposal = disposals.get(model) ?? null;

	state.loading = Promise.resolve().then(async () => {
		if (pendingDisposal !== null) {
			await pendingDisposal;
		}

		return withRemotionModelHost(
			async ({
				AutoModelForImageSegmentation,
				AutoProcessor,
				BackgroundRemovalPipeline,
			}) => {
				const hostedModelId = getHostedVideoMattingModelId(model);
				const totalBytes = modelInfo.webGpuDownloadSize;
				const loadedByFile = new Map<string, number>();
				let lastProgress = 0;
				let lastLoadedBytes = 0;

				notifyProgress(state, {
					status: 'loading',
					file: null,
					progress: 0,
					loadedBytes: 0,
					totalBytes,
				});

				const pretrainedOptions = {
					device: 'webgpu' as const,
					dtype: modelInfo.dtype,
					progress_callback: (event: unknown) => {
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
							notifyProgress(state, {
								status: 'loading',
								file: null,
								progress: lastProgress,
								loadedBytes: Math.min(lastLoadedBytes, totalBytes),
								totalBytes,
							});
						}
					},
				};
				const transformerProcessor = await AutoProcessor.from_pretrained(
					hostedModelId,
					pretrainedOptions,
				);
				const transformerModel =
					await AutoModelForImageSegmentation.from_pretrained(
						hostedModelId,
						pretrainedOptions,
					);
				let transformerPipeline: TransformerPipeline | null = null;
				let returnedPipeline = false;
				try {
					transformerPipeline = new BackgroundRemovalPipeline({
						task: 'background-removal',
						model: transformerModel,
						processor: transformerProcessor,
					}) as unknown as TransformerPipeline;
					const loadedTransformerPipeline = transformerPipeline;

					notifyProgress(state, {
						status: 'ready',
						file: null,
						progress: 1,
						loadedBytes: totalBytes,
						totalBytes,
					});

					const loadedPipeline: LoadedPipeline = {
						run: async (image) => {
							const result = await loadedTransformerPipeline(image);
							if (result.channels !== 4) {
								throw new Error(
									`The video matting model "${model}" returned ${result.channels} channels instead of RGBA.`,
								);
							}

							const data =
								result.data instanceof Uint8ClampedArray &&
								result.data.buffer instanceof ArrayBuffer
									? (result.data as Uint8ClampedArray<ArrayBuffer>)
									: new Uint8ClampedArray(result.data);

							return {
								data,
								width: result.width,
								height: result.height,
								channels: 4,
							};
						},
						dispose: () => loadedTransformerPipeline.dispose(),
					};
					returnedPipeline = true;
					return loadedPipeline;
				} finally {
					if (!returnedPipeline) {
						if (transformerPipeline === null) {
							await transformerModel.dispose();
						} else {
							await transformerPipeline.dispose();
						}
					}
				}
			},
		);
	});

	pipelines.set(model, state);
	state.loading.catch(() => {
		if (pipelines.get(model) === state) {
			pipelines.delete(model);
		}
	});

	return {state, alreadyLoaded: false};
};

const subscribeToProgress = (
	state: LoadedVideoMattingPipelineState,
	onProgress: OnVideoMattingModelLoadProgress | undefined,
): (() => void) => {
	if (!onProgress) {
		return () => undefined;
	}

	const listener: OnVideoMattingModelLoadProgress = (progress) => {
		onProgress(progress);
	};

	state.progressListeners.add(listener);
	if (state.lastProgress) {
		try {
			listener(state.lastProgress);
		} catch {
			// Progress callbacks are observers and must not affect shared loading.
		}
	}

	return () => {
		state.progressListeners.delete(listener);
	};
};

export const loadVideoMattingModel = async ({
	model,
	onProgress,
}: LoadVideoMattingModelOptions): Promise<LoadVideoMattingModelResult> => {
	const {state, alreadyLoaded} = getOrCreateVideoMattingPipeline({model});
	const unsubscribe = subscribeToProgress(state, onProgress);
	try {
		await state.loading;
	} finally {
		unsubscribe();
	}

	return {alreadyLoaded};
};

export const withLoadedVideoMattingPipeline = async <ReturnValue>({
	model,
	onProgress,
	signal,
	run,
}: {
	model: VideoMattingModel;
	onProgress?: OnVideoMattingModelLoadProgress;
	signal: AbortSignal | null;
	run: (pipeline: LoadedVideoMattingPipeline) => Promise<ReturnValue>;
}): Promise<ReturnValue> => {
	const {state} = getOrCreateVideoMattingPipeline({model});
	const unsubscribe = subscribeToProgress(state, onProgress);
	state.pendingUses++;
	let isActive = false;
	try {
		const loaded = await waitForLoadingOrAbort({
			loading: state.loading,
			signal,
		});
		state.pendingUses--;
		state.activeUses++;
		isActive = true;
		return await run(loaded.run);
	} finally {
		unsubscribe();
		if (isActive) {
			state.activeUses--;
		} else {
			state.pendingUses--;
		}

		notifyIfIdle(state);
	}
};

export type DisposeVideoMattingModelOptions = {
	model?: VideoMattingModel;
};

export const disposeVideoMattingModel = async ({
	model,
}: DisposeVideoMattingModelOptions = {}): Promise<void> => {
	if (model !== undefined) {
		getVideoMattingModelInfo(model);
	}

	const matching = [...pipelines.entries()].filter(([loadedModel]) => {
		return model === undefined || loadedModel === model;
	});
	for (const [key, state] of matching) {
		if (pipelines.get(key) === state) {
			pipelines.delete(key);
		}
	}

	const pending = new Map<VideoMattingModel, Promise<void>>();
	for (const [key, disposal] of disposals) {
		if (model === undefined || model === key) {
			pending.set(key, disposal);
		}
	}

	for (const [key, state] of matching) {
		const previousDisposal = disposals.get(key) ?? Promise.resolve();
		const disposal = previousDisposal.then(async () => {
			const loadedPipeline = await state.loading;
			if (state.pendingUses > 0 || state.activeUses > 0) {
				await new Promise<void>((resolve) => {
					state.onIdle.push(resolve);
				});
			}

			await loadedPipeline.dispose();
		});
		const disposalBarrier = disposal.then(
			() => undefined,
			() => undefined,
		);
		disposals.set(key, disposalBarrier);
		disposalBarrier.then(() => {
			if (disposals.get(key) === disposalBarrier) {
				disposals.delete(key);
			}
		});
		pending.set(key, disposal);
	}

	await Promise.all(pending.values());
};
