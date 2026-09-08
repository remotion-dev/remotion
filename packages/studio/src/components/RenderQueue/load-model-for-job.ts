export const loadModelForJob = async <Model extends string>({
	isModelCached,
	loadModel,
	model,
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
	progressSpan: number;
	progressStart: number;
	updateProgress: (progress: {message: string; value: number}) => void;
}) => {
	const cached = await isModelCached(model);
	await loadModel(model, (progress) => {
		const percentage =
			progress === null ? '' : ` ${Math.round(progress * 100)}%`;
		updateProgress({
			message: `${cached ? 'Loading' : 'Downloading'} ${model}${percentage}`,
			value: progressStart + (progress ?? 0) * progressSpan,
		});
	});
};
