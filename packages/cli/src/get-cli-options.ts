import type {
	BrowserExecutable,
	ChromiumOptions,
	FrameRange,
} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import fs from 'fs';
import path from 'path';
import {ConfigInternals} from './config';
import {getEnvironmentVariables} from './get-env';
import {getInputProps} from './get-input-props';
import {Log} from './log';

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

const getAndValidateShouldOutputImageSequence = ({
	frameRange,
}: {
	frameRange: FrameRange | null;
}) => {
	const shouldOutputImageSequence =
		ConfigInternals.getShouldOutputImageSequence(frameRange);

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
			: getAndValidateShouldOutputImageSequence({
					frameRange,
			  });

	const overwrite = ConfigInternals.getShouldOverwrite({
		defaultValue: !options.isLambda,
	});
	const crf = getCrf(shouldOutputImageSequence);
	const videoBitrate = ConfigInternals.getVideoBitrate();

	const pixelFormat = ConfigInternals.getPixelFormat();
	const proResProfile = getProResProfile();
	const browserExecutable = ConfigInternals.getBrowserExecutable();
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
		inputProps: getInputProps(null),
		envVariables: await getEnvironmentVariables(null),
		quality: ConfigInternals.getQuality(),
		browser: await getAndValidateBrowser(browserExecutable),
		crf,
		pixelFormat,
		proResProfile,
		everyNthFrame,
		numberOfGifLoops,
		stillFrame: ConfigInternals.getStillFrame(),
		browserExecutable,
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
		configFileImageFormat: ConfigInternals.getUserPreferredImageFormat(),
	};
};
