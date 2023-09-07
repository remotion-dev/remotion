import {execSync} from 'node:child_process';
import os from 'node:os';

// Kubernetes uses the following command to spawn Docker containers:
// docker run --cpuset-cpus="0,1" to assign only 2 CPUs.
// However, Node.js returns the core count of the host system (up to 96!)
// We also get it from nproc and use the minimum of the two.
const getConcurrencyFromNProc = (): number | null => {
	try {
		return parseInt(execSync('nproc').toString().trim(), 10);
	} catch (error) {
		return null;
	}
};

const getMaxCpus = () => {
	const node = os.cpus().length;
	const nproc = getConcurrencyFromNProc();
	if (nproc === null) {
		return node;
	}

	return Math.min(nproc, node);
};

export const getActualConcurrency = (
	userPreference: number | string | null,
) => {
	const maxCpus = getMaxCpus();

	if (userPreference === null) {
		return Math.round(Math.min(8, Math.max(1, maxCpus / 2)));
	}

	const min = 1;
	let rounded;

	if (typeof userPreference === 'string') {
		const percentage = parseInt(userPreference.slice(0, -1), 10);
		rounded = Math.floor((percentage / 100) * maxCpus);
	} else {
		rounded = Math.floor(userPreference);
	}

	if (rounded > maxCpus) {
		throw new Error(
			`Maximum for --concurrency is ${maxCpus} (number of cores on this system)`,
		);
	}

	if (rounded < min) {
		throw new Error(`Minimum for concurrency is ${min}.`);
	}

	return rounded;
};
