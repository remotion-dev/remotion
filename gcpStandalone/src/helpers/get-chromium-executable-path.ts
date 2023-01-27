if (
	/^AWS_Lambda_nodejs(?:10|12|14|16|18)[.]x$/.test(
		process.env.AWS_EXECUTION_ENV ?? ''
	) === true
) {
	if (process.env.FONTCONFIG_PATH === undefined) {
		process.env.FONTCONFIG_PATH = '/opt';
		process.env.FONTCONFIG_FILE = '/opt/fonts.conf';
	}

	process.env.LD_LIBRARY_PATH = '/opt/lib:/opt/bin';
}

export const executablePath = async (): Promise<string | undefined> => {
	return '/opt/bin/chromium';
};
