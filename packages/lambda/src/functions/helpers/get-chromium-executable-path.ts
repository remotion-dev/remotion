import LambdaFS from 'lambdafs';

if (
	/^AWS_Lambda_nodejs(?:10|12|14)[.]x$/.test(
		process.env.AWS_EXECUTION_ENV ?? ''
	) === true
) {
	if (process.env.FONTCONFIG_PATH === undefined) {
		process.env.FONTCONFIG_PATH = '/opt/aws';
	}

	if (process.env.LD_LIBRARY_PATH === undefined) {
		process.env.LD_LIBRARY_PATH = '/opt/aws/lib:/opt/lib:/opt/bin';
	} else if (process.env.LD_LIBRARY_PATH.startsWith('/opt/aws/lib') !== true) {
		process.env.LD_LIBRARY_PATH = [
			...new Set([
				'/opt/aws/lib:/opt/lib:/opt/bin',
				...process.env.LD_LIBRARY_PATH.split(':'),
			]),
		].join(':');
	}
}

export const executablePath = async (): Promise<string> => {
	return LambdaFS.inflate('/opt/bin/chromium.br');
};
