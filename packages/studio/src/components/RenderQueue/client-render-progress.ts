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

	const allRendered = progress.renderedFrames === progress.totalFrames;

	if (!allRendered) {
		const etaString =
			progress.renderEstimatedTime > 0
				? `, time remaining: ${formatEtaString(progress.renderEstimatedTime)}`
				: '';

		return `Rendered ${progress.renderedFrames}/${progress.totalFrames}${etaString}`;
	}

	return `Encoded ${progress.encodedFrames}/${progress.totalFrames}`;
};
