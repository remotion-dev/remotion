import {RENDER_SERVICE_PREFIX} from './constants';
import {serviceVersionString} from './service-version-string';

export const generateServiceName = ({
	memoryLimit,
	cpuLimit,
	timeoutSeconds,
	remotionVersion,
}: {
	memoryLimit: string;
	cpuLimit: string;
	timeoutSeconds: number;
	remotionVersion: string;
}): string => {
	const sanitisedCPU = cpuLimit.replace(/\./g, '-').substring(0, 10);

	const sanitisedMem = memoryLimit
		.replace(/\./g, '-')
		.substring(0, 10)
		.toLowerCase();

	return [
		RENDER_SERVICE_PREFIX,
		serviceVersionString(remotionVersion),
		`mem${sanitisedMem}`,
		`cpu${sanitisedCPU}`,
		`t-${String(timeoutSeconds)}`,
	].join('--');
};
