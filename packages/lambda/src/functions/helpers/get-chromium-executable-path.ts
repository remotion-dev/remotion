if (
	/^AWS_Lambda_nodejs(?:10|12|14)[.]x$/.test(
		process.env.AWS_EXECUTION_ENV ?? ''
	) === true
) {
	if (process.env.FONTCONFIG_PATH === undefined) {
		process.env.FONTCONFIG_PATH = '/tmp/aws';
	}

	if (process.env.LD_LIBRARY_PATH === undefined) {
		process.env.LD_LIBRARY_PATH = '/tmp/aws/lib';
	} else if (process.env.LD_LIBRARY_PATH.startsWith('/tmp/aws/lib') !== true) {
		process.env.LD_LIBRARY_PATH = [
			...new Set(['/tmp/aws/lib', ...process.env.LD_LIBRARY_PATH.split(':')]),
		].join(':');
	}
}

export const executablePath = async (): Promise<string> => {
	return Promise.resolve('/usr/bin/chromium-browser');
};
