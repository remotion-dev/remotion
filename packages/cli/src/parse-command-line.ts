import type {
	AudioCodec,
	BrowserExecutable,
	Codec,
	FfmpegExecutable,
	ImageFormat,
	LogLevel,
	OpenGlRenderer,
	PixelFormat,
	ProResProfile,
} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import minimist from 'minimist';
import {resolve} from 'path';
import {Config, ConfigInternals} from './config';
import {Log} from './log';

export type CommandLineOptions = {
	['browser-executable']: BrowserExecutable;
	['ffmpeg-executable']: FfmpegExecutable;
	['ffprobe-executable']: FfmpegExecutable;
	['pixel-format']: PixelFormat;
	['image-format']: ImageFormat;
	['prores-profile']: ProResProfile;
	['bundle-cache']: string;
	['env-file']: string;
	['ignore-certificate-errors']: string;
	['disable-web-security']: string;
	['every-nth-frame']: number;
	['number-of-gif-loops']: number;
	['number-of-shared-audio-tags']: number;
	codec: Codec;
	concurrency: number;
	timeout: number;
	config: string;
	['public-dir']: string;
	['audio-bitrate']: string;
	['video-bitrate']: string;
	['audio-codec']: AudioCodec;
	crf: number;
	force: boolean;
	overwrite: boolean;
	png: boolean;
	props: string;
	quality: number;
	frames: string | number;
	scale: number;
	sequence: boolean;
	quiet: boolean;
	q: boolean;
	log: string;
	help: boolean;
	port: number;
	frame: string | number;
	['disable-headless']: boolean;
	['disable-keyboard-shortcuts']: boolean;
	muted: boolean;
	height: number;
	width: number;
	runs: number;
	concurrencies: string;
	['enforce-audio-track']: boolean;
	gl: OpenGlRenderer;
	['package-manager']: string;
	['webpack-poll']: number;
	['no-open']: boolean;
	['browser']: string;
	['browser-args']: string;
};

export const BooleanFlags = [
	'force',
	'overwrite',
	'sequence',
	'help',
	'quiet',
	'q',
	'muted',
	'enforce-audio-track',
	// Lambda flags
	'force',
	'disable-chunk-optimization',
	'save-browser-logs',
	'disable-cloudwatch',
	'yes',
	'y',
	'disable-web-security',
	'ignore-certificate-errors',
	'disable-headless',
	'disable-keyboard-shortcuts',
	'default-only',
	'no-open',
];

export const parsedCli = minimist<CommandLineOptions>(process.argv.slice(2), {
	boolean: BooleanFlags,
}) as CommandLineOptions & {
	_: string[];
};

export const parseCommandLine = () => {
	if (parsedCli['pixel-format']) {
		Config.setPixelFormat(parsedCli['pixel-format']);
	}

	if (parsedCli['image-format']) {
		Config.setImageFormat(parsedCli['image-format']);
	}

	if (parsedCli['browser-executable']) {
		Config.setBrowserExecutable(parsedCli['browser-executable']);
	}

	if (parsedCli['ffmpeg-executable']) {
		Config.setFfmpegExecutable(resolve(parsedCli['ffmpeg-executable']));
	}

	if (parsedCli['number-of-gif-loops']) {
		Config.setNumberOfGifLoops(parsedCli['number-of-gif-loops']);
	}

	if (parsedCli['ffprobe-executable']) {
		Config.setFfprobeExecutable(resolve(parsedCli['ffprobe-executable']));
	}

	if (typeof parsedCli['bundle-cache'] !== 'undefined') {
		Config.setCachingEnabled(parsedCli['bundle-cache'] !== 'false');
	}

	if (parsedCli['disable-web-security']) {
		Config.setChromiumDisableWebSecurity(true);
	}

	if (parsedCli['ignore-certificate-errors']) {
		Config.setChromiumIgnoreCertificateErrors(true);
	}

	if (parsedCli['disable-headless']) {
		Config.setChromiumHeadlessMode(false);
	}

	if (parsedCli.log) {
		if (!RenderInternals.isValidLogLevel(parsedCli.log)) {
			Log.error('Invalid `--log` value passed.');
			Log.error(
				`Accepted values: ${RenderInternals.logLevels
					.map((l) => `'${l}'`)
					.join(', ')}.`
			);
			process.exit(1);
		}

		ConfigInternals.Logging.setLogLevel(parsedCli.log as LogLevel);
	}

	if (parsedCli.concurrency) {
		Config.setConcurrency(parsedCli.concurrency);
	}

	if (parsedCli.timeout) {
		Config.setTimeoutInMilliseconds(parsedCli.timeout);
	}

	if (parsedCli.height) {
		Config.overrideHeight(parsedCli.height);
	}

	if (parsedCli.width) {
		Config.overrideWidth(parsedCli.width);
	}

	if (parsedCli.frames) {
		ConfigInternals.setFrameRangeFromCli(parsedCli.frames);
	}

	if (parsedCli.frame) {
		ConfigInternals.setStillFrame(Number(parsedCli.frame));
	}

	if (parsedCli.png) {
		Log.warn(
			'The --png flag has been deprecrated. Use --sequence --image-format=png from now on.'
		);
		Config.setImageSequence(true);
		Config.setImageFormat('png');
	}

	if (parsedCli.sequence) {
		Config.setImageSequence(true);
	}

	if (typeof parsedCli.crf !== 'undefined') {
		Config.setCrf(parsedCli.crf);
	}

	if (parsedCli['every-nth-frame']) {
		Config.setEveryNthFrame(parsedCli['every-nth-frame']);
	}

	if (parsedCli.gl) {
		Config.setChromiumOpenGlRenderer(parsedCli.gl);
	}

	if (parsedCli['prores-profile']) {
		Config.setProResProfile(
			String(parsedCli['prores-profile']) as ProResProfile
		);
	}

	if (parsedCli.overwrite) {
		Config.setOverwriteOutput(parsedCli.overwrite);
	}

	if (typeof parsedCli.quality !== 'undefined') {
		Config.setQuality(parsedCli.quality);
	}

	if (typeof parsedCli.scale !== 'undefined') {
		Config.setScale(parsedCli.scale);
	}

	if (typeof parsedCli.port !== 'undefined') {
		Config.setPort(parsedCli.port);
	}

	if (typeof parsedCli.muted !== 'undefined') {
		Config.setMuted(parsedCli.muted);
	}

	if (typeof parsedCli['disable-keyboard-shortcuts'] !== 'undefined') {
		Config.setKeyboardShortcutsEnabled(
			!parsedCli['disable-keyboard-shortcuts']
		);
	}

	if (typeof parsedCli['enforce-audio-track'] !== 'undefined') {
		Config.setEnforceAudioTrack(parsedCli['enforce-audio-track']);
	}

	if (typeof parsedCli['public-dir'] !== 'undefined') {
		Config.setPublicDir(parsedCli['public-dir']);
	}

	if (typeof parsedCli['webpack-poll'] !== 'undefined') {
		Config.setWebpackPollingInMilliseconds(parsedCli['webpack-poll']);
	}

	if (typeof parsedCli['audio-bitrate'] !== 'undefined') {
		Config.setAudioBitrate(parsedCli['audio-bitrate']);
	}

	if (typeof parsedCli['video-bitrate'] !== 'undefined') {
		Config.setVideoBitrate(parsedCli['video-bitrate']);
	}
};

export const quietFlagProvided = () => parsedCli.quiet || parsedCli.q;
