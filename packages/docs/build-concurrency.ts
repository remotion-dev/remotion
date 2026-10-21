import {availableParallelism, cpus} from 'os';

const cpuCount =
	typeof availableParallelism === 'function'
		? availableParallelism()
		: cpus().length;

// Leave CPU capacity for other work during local docs builds.
export const defaultDocsBuildConcurrency = Math.max(
	1,
	Math.min(4, Math.floor(cpuCount / 2)),
);
