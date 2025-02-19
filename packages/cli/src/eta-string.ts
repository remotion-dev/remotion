import {truthy} from './truthy';

export const formatEtaString = (timeRemainingInMilliseconds: number) => {
	// Get render estimated time value and extract hours, minutes, and seconds
	const remainingTime = timeRemainingInMilliseconds / 1000;
	const remainingTimeHours = Math.floor(remainingTime / 3600);
	const remainingTimeMinutes = Math.floor((remainingTime % 3600) / 60);
	const remainingTimeSeconds = Math.floor(remainingTime % 60);

	// Create estimated time string by concatenating them with colons
	const estimatedTimeString = [
		remainingTimeHours ? `${remainingTimeHours}h` : null,
		remainingTimeMinutes ? remainingTimeMinutes + 'm' : null,
		`${remainingTimeSeconds}s`,
	]
		.filter(truthy)
		.join(' ');

	return estimatedTimeString;
};
