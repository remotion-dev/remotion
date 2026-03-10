import type {ClientRenderJobProgress} from './client-side-render-types';

export const formatEtaString = (timeRemainingInMilliseconds: number) => {
	const remainingTime = timeRemainingInMilliseconds / 1000;
	const remainingTimeHours = Math.floor(remainingTime / 3600);
	const remainingTimeMinutes = Math.floor((remainingTime % 3600) / 60);
	const remainingTimeSeconds = Math.floor(remainingTime % 60);

	return [
		remainingTimeHours ? `${remainingTimeHours}h` : null,
		remainingTimeMinutes ? `${remainingTimeMinutes}m` : null,
		`${remainingTimeSeconds}s`,
	]
		.filter((value): value is string => Boolean(value))
		.join(' ');
};

export const getClientRenderProgressMessage = (
	progress: ClientRenderJobProgress,
) => {
	if (progress.totalFrames === 0) {
		return 'Getting composition';
	}

	if (progress.doneIn !== null) {
		return `Encoded ${progress.totalFrames}/${progress.totalFrames}`;
	}

	if (progress.renderEstimatedTime > 0) {
		const etaString = `, time remaining: ${formatEtaString(progress.renderEstimatedTime)}`;

		return `Rendering ${progress.encodedFrames}/${progress.totalFrames}${etaString}`;
	}

	return `Encoded ${progress.encodedFrames}/${progress.totalFrames}`;
};
