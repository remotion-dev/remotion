import {readFileSync} from 'node:fs';

const getMaxMemoryFromCgroupV2 = (): number | null => {
	try {
		const data = readFileSync('/sys/fs/cgroup/memory.max', 'utf-8');
		// If --memory=[num] flag of "docker run" is not set, the value will be "max"
		if (data.trim() === 'max') {
			return Infinity;
		}

		return parseInt(data, 10);
	} catch {
		return null;
	}
};

const getAvailableMemoryFromCgroupV2 = (): number | null => {
	try {
		const data = readFileSync('/sys/fs/cgroup/memory.current', 'utf-8');
		return parseInt(data, 10);
	} catch {
		return null;
	}
};

const getMaxMemoryFromCgroupV1 = (): number | null => {
	try {
		const data = readFileSync(
			'/sys/fs/cgroup/memory/memory.limit_in_bytes',
			'utf-8',
		);

		// If --memory=[num] flag of "docker run" is not set, the value will be "max"
		if (data.trim() === 'max') {
			return Infinity;
		}

		return parseInt(data, 10);
	} catch {
		return null;
	}
};

const getAvailableMemoryFromCgroupV1 = (): number | null => {
	try {
		const data = readFileSync(
			'/sys/fs/cgroup/memory/memory.usage_in_bytes',
			'utf-8',
		);
		return parseInt(data, 10);
	} catch {
		return null;
	}
};

export const getAvailableMemoryFromCgroup = (): number | null => {
	const maxMemoryV2 = getMaxMemoryFromCgroupV2();
	if (maxMemoryV2 !== null) {
		const availableMemoryV2 = getAvailableMemoryFromCgroupV2();
		if (availableMemoryV2 !== null) {
			return maxMemoryV2 - availableMemoryV2;
		}
	}

	const maxMemoryV1 = getMaxMemoryFromCgroupV1();
	if (maxMemoryV1 !== null) {
		const availableMemoryV1 = getAvailableMemoryFromCgroupV1();
		if (availableMemoryV1 !== null) {
			return maxMemoryV1 - availableMemoryV1;
		}
	}

	return null;
};
