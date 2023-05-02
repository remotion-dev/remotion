import {RENDER_SERVICE_PREFIX} from './constants';
import {SERVICE_VERSION_STRING} from './service-version-string';

export const generateServiceName = ({
	memoryLimit,
	cpuLimit,
}: {
	memoryLimit: string;
	cpuLimit: string;
}): string => {
	const sanitisedCPU = cpuLimit.replace(/\./g, '-').substring(0, 10);

	const sanitisedMem = memoryLimit
		.replace(/\./g, '-')
		.substring(0, 10)
		.toLowerCase();

	return [
		RENDER_SERVICE_PREFIX,
		SERVICE_VERSION_STRING,
		`mem${sanitisedMem}`,
		`cpu${sanitisedCPU}`,
	].join('--');
};
