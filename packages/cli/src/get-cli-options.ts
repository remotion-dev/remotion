import type {
	BrowserExecutable,
	ChromiumOptions,
	Codec,
	FrameRange,
} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import fs from 'fs';
import path from 'path';
import {ConfigInternals} from './config';
import {getEnvironmentVariables} from './get-env';
import {getFinalOutputCodec} from './get-final-output-codec';
import {getInputProps} from './get-input-props';
import {Log} from './log';
import {parsedCli} from './parse-command-line';

const getAndValidateFrameRange = () => {
	const frameRange = ConfigInternals.getRange();
	if (typeof frameRange === 'number') {
		Log.warn('Selected a single frame. Assuming you want to output an image.');
		Log.warn(
			`If you want to render a video, pass a range:  '--frames=${frameRange}-${frameRange}'.`
		);
		Log.warn("To dismiss this message, add the '--sequence' flag explicitly.");
	}

	return frameRange;
};

export const validateFfmepgCanUseCodec = async (
	codec: Codec,
	remotionRoot: string
) => {
	const ffmpegExecutable = ConfigInternals.getCustomFfmpegExecutable();
	if (
		codec === 'vp8' &&
		!(await RenderInternals.ffmpegHasFeature({
			feature: 'enable-libvpx',
			ffmpegExecutable,
			remotionRoot,
		}))
	) {
		Log.error(
			"The Vp8 codec has been selected, but your FFMPEG binary wasn't compiled with the --enable-lipvpx flag."
		);
		Log.error(
			'This does not work, please switch out your FFMPEG binary or choose a different codec.'
		);
	}

	if (
		codec === 'h265' &&
		!(await RenderInternals.ffmpegHasFeature({
			feature: 'enable-gpl',
			ffmpegExecutable,
			remotionRoot,
		}))
	) {
		Log.error(
			"The H265 codec has been selected, but your FFMPEG binary wasn't compiled with the --enable-gpl flag."
		);
		Log.error(
			'This does not work, please recompile your FFMPEG binary with --enable-gpl --enable-libx265 or choose a different codec.'
		);
	}

	if (
		codec === 'h265' &&
		!(await RenderInternals.ffmpegHasFeature({
			feature: 'enable-libx265',
			ffmpegExecutable,
			remotionRoot,
		}))
	) {
		Log.error(
			"The H265 codec has been selected, but your FFMPEG binary wasn't compiled with the --enable-libx265 flag."
		);
		Log.error(
			'This does not work, please recompile your FFMPEG binary with --enable-gpl --enable-libx265 or choose a different codec.'
		);
	}
};

export const getFinalCodec = (options: {
	downloadName: string | null;
	outName: string | null;
}): {codec: Codec; reason: string} => {
	const {codec, reason} = getFinalOutputCodec({
		cliFlag: parsedCli.codec,
		configFile: ConfigInternals.getOutputCodecOrUndefined() ?? null,
		downloadName: options.downloadName,
		outName: options.outName,
	});

	return {codec, reason};
};

const getBrowser = () =>
	ConfigInternals.getBrowser() ?? RenderInternals.DEFAULT_BROWSER;

export const getAndValidateAbsoluteOutputFile = (
	relativeOutputLocation: string,
	overwrite: boolean
) => {
	const absoluteOutputFile = path.resolve(
		process.cwd(),
		relativeOutputLocation
	);
	if (fs.existsSync(absoluteOutputFile) && !overwrite) {
		Log.error(
			`File at ${absoluteOutputFile} already exists. Use --overwrite to overwrite.`
		);
		process.exit(1);
	}

	return absoluteOutputFile;
};

const getAndValidateShouldOutputImageSequence = async ({
	frameRange,
	isLambda,
	remotionRoot,
}: {
	frameRange: FrameRange | null;
	isLambda: boolean;
	remotionRoot: string;
}) => {
	const shouldOutputImageSequence =
		ConfigInternals.getShouldOutputImageSequence(frameRange);
	// When parsing options locally, we don't need FFMPEG because the render will happen on Lambda
	if (!shouldOutputImageSequence && !isLambda) {
		await RenderInternals.validateFfmpeg(
			ConfigInternals.getCustomFfmpegExecutable(),
			remotionRoot
		);
	}

	return shouldOutputImageSequence;
};

const getCrf = (shouldOutputImageSequence: boolean) => {
	const crf = shouldOutputImageSequence
		? null
		: ConfigInternals.getCrfOrUndefined();

	return crf;
};

const getProResProfile = () => {
	const proResProfile = ConfigInternals.getProResProfile();

	return proResProfile;
};

const getAndValidateBrowser = async (browserExecutable: BrowserExecutable) => {
	const browser = getBrowser();
	try {
		await RenderInternals.ensureLocalBrowser(browser, browserExecutable);
	} catch (err) {
		Log.error('Could not download a browser for rendering frames.');
		Log.error(err);
		process.exit(1);
	}

	return browser;
};

export const getCliOptions = async (options: {
	isLambda: boolean;
	type: 'still' | 'series' | 'get-compositions';
	remotionRoot: string;
}) => {
	const frameRange = getAndValidateFrameRange();

	const shouldOutputImageSequence =
		options.type === 'still'
			? true
			: await getAndValidateShouldOutputImageSequence({
					frameRange,
					isLambda: options.isLambda,
					remotionRoot: options.remotionRoot,
			  });

	const overwrite = ConfigInternals.getShouldOverwrite({
		defaultValue: !options.isLambda,
	});
	const crf = getCrf(shouldOutputImageSequence);
	const videoBitrate = ConfigInternals.getVideoBitrate();

	const pixelFormat = ConfigInternals.getPixelFormat();
	const proResProfile = getProResProfile();
	const browserExecutable = ConfigInternals.getBrowserExecutable();
	const ffmpegExecutable = ConfigInternals.getCustomFfmpegExecutable();
	const ffprobeExecutable = ConfigInternals.getCustomFfprobeExecutable();
	const scale = ConfigInternals.getScale();
	const port = ConfigInternals.getServerPort();

	const chromiumOptions: ChromiumOptions = {
		disableWebSecurity: ConfigInternals.getChromiumDisableWebSecurity(),
		ignoreCertificateErrors: ConfigInternals.getIgnoreCertificateErrors(),
		headless: ConfigInternals.getChromiumHeadlessMode(),
		gl:
			ConfigInternals.getChromiumOpenGlRenderer() ??
			RenderInternals.DEFAULT_OPENGL_RENDERER,
	};
	const everyNthFrame = ConfigInternals.getEveryNthFrame();
	const numberOfGifLoops = ConfigInternals.getNumberOfGifLoops();

	const concurrency = ConfigInternals.getConcurrency();

	const height = ConfigInternals.getHeight();
	const width = ConfigInternals.getWidth();

	RenderInternals.validateConcurrency(concurrency, 'concurrency');

	return {
		puppeteerTimeout: ConfigInternals.getCurrentPuppeteerTimeout(),
		concurrency,
		frameRange,
		shouldOutputImageSequence,
		inputProps: getInputProps(() => undefined),
		envVariables: await getEnvironmentVariables(() => undefined),
		quality: ConfigInternals.getQuality(),
		browser: await getAndValidateBrowser(browserExecutable),
		crf,
		pixelFormat,
		proResProfile,
		everyNthFrame,
		numberOfGifLoops,
		stillFrame: ConfigInternals.getStillFrame(),
		browserExecutable,
		ffmpegExecutable,
		ffprobeExecutable,
		logLevel: ConfigInternals.Logging.getLogLevel(),
		scale,
		chromiumOptions,
		overwrite,
		port: port ?? null,
		muted: ConfigInternals.getMuted(),
		enforceAudioTrack: ConfigInternals.getEnforceAudioTrack(),
		publicDir: ConfigInternals.getPublicDir(),
		ffmpegOverride: ConfigInternals.getFfmpegOverrideFunction(),
		audioBitrate: ConfigInternals.getAudioBitrate(),
		videoBitrate,
		height,
		width,
	};
};
