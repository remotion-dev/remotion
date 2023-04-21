import {SERVICE_VERSION_STRING} from './service-version-string';

export const generateServiceName = ({
	memory,
	cpu,
}: {
	memory: string;
	cpu: string;
}): string => {
	const sanitisedCPU = cpu.replace(/\./g, '-').substring(0, 10);

	const sanitisedMem = memory
		.replace(/\./g, '-')
		.substring(0, 10)
		.toLowerCase();

	return [
		'remotion',
		`${SERVICE_VERSION_STRING}`,
		`mem${sanitisedMem}`,
		`cpu${sanitisedCPU}`,
	].join('--');
};
