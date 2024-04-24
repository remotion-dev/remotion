if (
	/^AWS_Lambda_nodejs(?:20)[.]x$/.test(process.env.AWS_EXECUTION_ENV ?? '') ===
	true
) {
	process.env.FONTCONFIG_PATH = '/opt';
	process.env.FONTCONFIG_FILE = '/opt/fonts.conf';

	process.env.DISABLE_FROM_SURFACE = '1';
	process.env.NO_COLOR = '1';
	process.env.NODE_EXTRA_CA_CERTS = '/var/runtime/ca-cert.pem';
}

export const executablePath = (): string => {
	return '/opt/bin/chromium';
};
