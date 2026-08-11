import {RENDER_SERVICE_PREFIX} from './constants';
import {serviceVersionString} from './service-version-string';

export const generateServiceName = ({
	memoryLimit,
	cpuLimit,
	timeoutSeconds,
}: {
	memoryLimit: string;
	cpuLimit: string;
	timeoutSeconds: number;
}): string => {
	const sanitisedCPU = cpuLimit.replace(/\./g, '-').substring(0, 10);

	const sanitisedMem = memoryLimit
		.replace(/\./g, '-')
		.substring(0, 10)
		.toLowerCase();

	return [
		RENDER_SERVICE_PREFIX,
		serviceVersionString(),
		`mem${sanitisedMem}`,
		`cpu${sanitisedCPU}`,
		`t${String(timeoutSeconds)}`,
	].join('-');
};
