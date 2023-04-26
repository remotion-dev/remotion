if (
	/^AWS_Lambda_nodejs(?:18)[.]x$/.test(process.env.AWS_EXECUTION_ENV ?? '') ===
	true
) {
	if (process.env.FONTCONFIG_PATH === undefined) {
		process.env.FONTCONFIG_PATH = '/opt';
		process.env.FONTCONFIG_FILE = '/opt/fonts.conf';
	}

	process.env.LD_LIBRARY_PATH = '/opt/lib:/opt/bin';
	process.env.FFMPEG_BIN_PATH = '/opt/ffmpeg/remotion/bin/ffmpeg';
	process.env.FFPROBE_BIN_PATH = '/opt/ffmpeg/remotion/bin/ffprobe';
	process.env.FFMPEG_CWD = '/opt/ffmpeg';
	process.env.COMPOSITOR_PATH = './compositor';
}

export const executablePath = (): string => {
	return '/opt/bin/chromium';
};
