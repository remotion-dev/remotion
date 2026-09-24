export const loadModelForJob = async <Model extends string>({
	isModelCached,
	loadModel,
	model,
	signal,
	progressSpan,
	progressStart,
	updateProgress,
}: {
	isModelCached: (model: Model) => Promise<boolean>;
	loadModel: (
		model: Model,
		onProgress: (progress: number | null) => void,
	) => Promise<unknown>;
	model: Model;
	signal: AbortSignal;
	progressSpan: number;
	progressStart: number;
	updateProgress: (progress: {message: string; value: number}) => void;
}) => {
	signal.throwIfAborted();
	const cached = await isModelCached(model);
	signal.throwIfAborted();
	await loadModel(model, (progress) => {
		signal.throwIfAborted();
		const percentage =
			progress === null ? '' : ` ${Math.round(progress * 100)}%`;
		updateProgress({
			message: `${cached ? 'Loading' : 'Downloading'} ${model}${percentage}`,
			value: progressStart + (progress ?? 0) * progressSpan,
		});
	});
	signal.throwIfAborted();
};
