import type {
	BrowserExecutable,
	ChromiumOptions,
	Codec,
	FrameRange,
	PixelFormat,
} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import fs from 'fs';
import path from 'path';
import {ConfigInternals} from './config';
import {getEnvironmentVariables} from './get-env';
import {getFinalOutputCodec} from './get-final-output-codec';
import {getInputProps} from './get-input-props';
import {getImageFormat} from './image-formats';
import {Log} from './log';
import {getUserPassedOutputLocation} from './user-passed-output-location';

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

const getFinalCodec = async (options: {isLambda: boolean}) => {
	const userCodec = ConfigInternals.getOutputCodecOrUndefined();

	const codec = getFinalOutputCodec({
		codec: userCodec,
		fileExtension: options.isLambda
			? null
			: RenderInternals.getExtensionOfFilename(getUserPassedOutputLocation()),
		emitWarning: true,
	});
	const ffmpegExecutable = ConfigInternals.getCustomFfmpegExecutable();
	if (
		codec === 'vp8' &&
		!(await RenderInternals.ffmpegHasFeature({
			feature: 'enable-libvpx',
			isLambda: options.isLambda,
			ffmpegExecutable,
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
			isLambda: options.isLambda,
			ffmpegExecutable,
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
			isLambda: options.isLambda,
			ffmpegExecutable,
		}))
	) {
		Log.error(
			"The H265 codec has been selected, but your FFMPEG binary wasn't compiled with the --enable-libx265 flag."
		);
		Log.error(
			'This does not work, please recompile your FFMPEG binary with --enable-gpl --enable-libx265 or choose a different codec.'
		);
	}

	return codec;
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
}: {
	frameRange: FrameRange | null;
	isLambda: boolean;
}) => {
	const shouldOutputImageSequence =
		ConfigInternals.getShouldOutputImageSequence(frameRange);
	// When parsing options locally, we don't need FFMPEG because the render will happen on Lambda
	if (!shouldOutputImageSequence && !isLambda) {
		await RenderInternals.validateFfmpeg(
			ConfigInternals.getCustomFfmpegExecutable()
		);
	}

	return shouldOutputImageSequence;
};

const getAndValidateCrf = (
	shouldOutputImageSequence: boolean,
	codec: Codec
) => {
	const crf = shouldOutputImageSequence
		? null
		: ConfigInternals.getActualCrf(codec);
	if (crf !== null) {
		RenderInternals.validateSelectedCrfAndCodecCombination(crf, codec);
	}

	return crf;
};

const getAndValidatePixelFormat = (codec: Codec) => {
	const pixelFormat = ConfigInternals.getPixelFormat();

	RenderInternals.validateSelectedPixelFormatAndCodecCombination(
		pixelFormat,
		codec
	);
	return pixelFormat;
};

const getAndValidateProResProfile = (actualCodec: Codec) => {
	const proResProfile = ConfigInternals.getProResProfile();
	RenderInternals.validateSelectedCodecAndProResCombination(
		actualCodec,
		proResProfile
	);

	return proResProfile;
};

const getAndValidateImageFormat = ({
	shouldOutputImageSequence,
	codec,
	pixelFormat,
}: {
	shouldOutputImageSequence: boolean;
	codec: Codec;
	pixelFormat: PixelFormat;
}) => {
	const imageFormat = getImageFormat(
		shouldOutputImageSequence ? undefined : codec
	);
	RenderInternals.validateSelectedPixelFormatAndImageFormatCombination(
		pixelFormat,
		imageFormat
	);
	return imageFormat;
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
}) => {
	const frameRange = getAndValidateFrameRange();

	const codec: Codec =
		options.type === 'get-compositions'
			? 'h264'
			: await getFinalCodec({
					isLambda: options.isLambda,
			  });
	const shouldOutputImageSequence =
		options.type === 'still'
			? true
			: await getAndValidateShouldOutputImageSequence({
					frameRange,
					isLambda: options.isLambda,
			  });

	const overwrite = ConfigInternals.getShouldOverwrite();
	const crf = getAndValidateCrf(shouldOutputImageSequence, codec);
	const pixelFormat = getAndValidatePixelFormat(codec);
	const imageFormat = getAndValidateImageFormat({
		shouldOutputImageSequence,
		codec,
		pixelFormat,
	});
	const proResProfile = getAndValidateProResProfile(codec);
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
	const everyNthFrame = ConfigInternals.getAndValidateEveryNthFrame(codec);
	const numberOfGifLoops =
		ConfigInternals.getAndValidateNumberOfGifLoops(codec);

	const concurrency = ConfigInternals.getConcurrency();

	RenderInternals.validateConcurrency(concurrency, 'concurrency');

	return {
		puppeteerTimeout: ConfigInternals.getCurrentPuppeteerTimeout(),
		concurrency,
		frameRange,
		shouldOutputImageSequence,
		codec,
		inputProps: getInputProps(() => undefined),
		envVariables: await getEnvironmentVariables(),
		quality: ConfigInternals.getQuality(),
		browser: await getAndValidateBrowser(browserExecutable),
		crf,
		pixelFormat,
		imageFormat,
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
	};
};
