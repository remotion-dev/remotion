if (
	/^AWS_Lambda_nodejs(?:18)[.]x$/.test(process.env.AWS_EXECUTION_ENV ?? '') ===
	true
) {
	process.env.FONTCONFIG_PATH = '/opt';
	process.env.FONTCONFIG_FILE = '/opt/fonts.conf';

	process.env.DISABLE_FROM_SURFACE = '1';
	process.env.NO_COLOR = '1';
}

export const executablePath = (): string => {
	return '/opt/bin/chromium';
};
