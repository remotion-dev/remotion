import os from 'node:os';
import {getCpuCount} from './get-cpu-count';
const MEMORY_USAGE_PER_THREAD = 400_000_000; // 400MB
const RESERVED_MEMORY = 2_000_000_000;

export const getIdealVideoThreadsFlag = () => {
	const freeMemory = os.freemem();
	const cpus = getCpuCount();

	const maxRecommendedBasedOnCpus = (cpus * 2) / 3;
	const maxRecommendedBasedOnMemory =
		(freeMemory - RESERVED_MEMORY) / MEMORY_USAGE_PER_THREAD;

	const maxRecommended = Math.min(
		maxRecommendedBasedOnCpus,
		maxRecommendedBasedOnMemory,
	);

	return Math.max(1, Math.round(maxRecommended));
};
