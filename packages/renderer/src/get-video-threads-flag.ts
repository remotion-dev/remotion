import {getCpuCount} from './get-cpu-count';
import type {LogLevel} from './log-level';
import {getAvailableMemory} from './memory/get-available-memory';

const MEMORY_USAGE_PER_THREAD = 400_000_000; // 400MB
const RESERVED_MEMORY = 2_000_000_000;
// Match Chromium's normal decoder thread limit. --video-threads bypasses that
// limit, and too many frame threads can require more packets before producing
// output than Mediabunny's decoder queue permits, causing frame extraction to hang.
const MAX_VIDEO_THREADS = 16;

export const getIdealVideoThreadsFlag = (logLevel: LogLevel) => {
	const freeMemory = getAvailableMemory(logLevel);
	const cpus = getCpuCount();

	const maxRecommendedBasedOnCpus = (cpus * 2) / 3;
	const maxRecommendedBasedOnMemory =
		(freeMemory - RESERVED_MEMORY) / MEMORY_USAGE_PER_THREAD;

	const maxRecommended = Math.min(
		maxRecommendedBasedOnCpus,
		maxRecommendedBasedOnMemory,
		MAX_VIDEO_THREADS,
	);

	return Math.max(1, Math.round(maxRecommended));
};
