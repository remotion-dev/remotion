import {RenderInternals} from '@remotion/renderer';
import fs from 'fs';
import path from 'path';
import {Codec, FrameRange, Internals, PixelFormat} from 'remotion';
import {getOutputFilename} from './get-filename';
import {getInputProps} from './get-input-props';
import {getImageFormat} from './image-formats';
import {Log} from './log';
import {getUserPassedFileExtension} from './user-passed-output-location';

const getAndValidateFrameRange = () => {
	const frameRange = Internals.getRange();
	if (typeof frameRange === 'number') {
		Log.Warn('Selected a single frame. Assuming you want to output an image.');
		Log.Warn(
			`If you want to render a video, pass a range:  '--frames=${frameRange}-${frameRange}'.`
		);
		Log.Warn("To dismiss this message, add the '--sequence' flag explicitly.");
	}
	return frameRange;
};

const getFinalCodec = async () => {
	const userCodec = Internals.getOutputCodecOrUndefined();

	const codec = Internals.getFinalOutputCodec({
		codec: userCodec,
		fileExtension: getUserPassedFileExtension(),
		emitWarning: true,
	});
	if (
		codec === 'vp8' &&
		!(await RenderInternals.ffmpegHasFeature('enable-libvpx'))
	) {
		Log.Error(
			"The Vp8 codec has been selected, but your FFMPEG binary wasn't compiled with the --enable-lipvpx flag."
		);
		Log.Error(
			'This does not work, please switch out your FFMPEG binary or choose a different codec.'
		);
	}
	if (
		codec === 'h265' &&
		!(await RenderInternals.ffmpegHasFeature('enable-gpl'))
	) {
		Log.Error(
			"The H265 codec has been selected, but your FFMPEG binary wasn't compiled with the --enable-gpl flag."
		);
		Log.Error(
			'This does not work, please recompile your FFMPEG binary with --enable-gpl --enable-libx265 or choose a different codec.'
		);
	}
	if (
		codec === 'h265' &&
		!(await RenderInternals.ffmpegHasFeature('enable-libx265'))
	) {
		Log.Error(
			"The H265 codec has been selected, but your FFMPEG binary wasn't compiled with the --enable-libx265 flag."
		);
		Log.Error(
			'This does not work, please recompile your FFMPEG binary with --enable-gpl --enable-libx265 or choose a different codec.'
		);
	}
	return codec;
};

const getBrowser = () => {
	return Internals.getBrowser() ?? Internals.DEFAULT_BROWSER;
};

const getAndValidateAbsoluteOutputFile = (
	outputFile: string,
	overwrite: boolean
) => {
	const absoluteOutputFile = path.resolve(process.cwd(), outputFile);
	if (fs.existsSync(absoluteOutputFile) && !overwrite) {
		Log.Error(
			`File at ${absoluteOutputFile} already exists. Use --overwrite to overwrite.`
		);
		process.exit(1);
	}
	return absoluteOutputFile;
};

const getAndValidateShouldOutputImageSequence = async (
	frameRange: FrameRange | null
) => {
	const shouldOutputImageSequence = Internals.getShouldOutputImageSequence(
		frameRange
	);
	if (!shouldOutputImageSequence) {
		await RenderInternals.validateFfmpeg();
	}
	return shouldOutputImageSequence;
};

const getAndValidateCrf = (
	shouldOutputImageSequence: boolean,
	codec: Codec
) => {
	const crf = shouldOutputImageSequence ? null : Internals.getActualCrf(codec);
	if (crf !== null) {
		Internals.validateSelectedCrfAndCodecCombination(crf, codec);
	}
	return crf;
};

const getAndValidatePixelFormat = (codec: Codec) => {
	const pixelFormat = Internals.getPixelFormat();

	Internals.validateSelectedPixelFormatAndCodecCombination(pixelFormat, codec);
	return pixelFormat;
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
	Internals.validateSelectedPixelFormatAndImageFormatCombination(
		pixelFormat,
		imageFormat
	);
	return imageFormat;
};

const getAndValidateBrowser = async () => {
	const browser = getBrowser();
	try {
		await RenderInternals.ensureLocalBrowser(browser);
	} catch (err) {
		Log.Error('Could not download a browser for rendering frames.');
		Log.Error(err);
		process.exit(1);
	}
	return browser;
};

export const getCliOptions = async () => {
	const frameRange = getAndValidateFrameRange();
	const shouldOutputImageSequence = await getAndValidateShouldOutputImageSequence(
		frameRange
	);
	const codec = await getFinalCodec();
	const outputFile = getOutputFilename(codec, shouldOutputImageSequence);
	const overwrite = Internals.getShouldOverwrite();
	const crf = getAndValidateCrf(shouldOutputImageSequence, codec);
	const pixelFormat = getAndValidatePixelFormat(codec);
	const imageFormat = getAndValidateImageFormat({
		shouldOutputImageSequence,
		codec,
		pixelFormat,
	});

	return {
		parallelism: Internals.getConcurrency(),
		frameRange,
		shouldOutputImageSequence,
		codec,
		overwrite: Internals.getShouldOverwrite(),
		inputProps: getInputProps(),
		quality: Internals.getQuality(),
		browser: await getAndValidateBrowser(),
		absoluteOutputFile: getAndValidateAbsoluteOutputFile(outputFile, overwrite),
		crf,
		pixelFormat,
		imageFormat,
	};
};
