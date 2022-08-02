import os from 'os';
const MEMORY_USAGE_PER_THREAD = 400_000_000; // 400MB
const RESERVED_MEMORY = 2_000_000_000;

export const getIdealVideoThreadsFlag = () => {
	const freeMemory = os.freemem();
	const cpus = os.cpus().length;

	const maxRecommendedBasedOnCpus = (cpus * 2) / 3;
	const maxRecommendedBasedOnMemory =
		(freeMemory - RESERVED_MEMORY) / MEMORY_USAGE_PER_THREAD;

	const maxRecommended = Math.min(
		maxRecommendedBasedOnCpus,
		maxRecommendedBasedOnMemory
	);

	return Math.max(1, Math.round(maxRecommended));
};
