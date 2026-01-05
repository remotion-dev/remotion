import type {HardwareAccelerationOption} from './client';
import type {Codec} from './codec';
import {validateQualitySettings} from './crf';
import {getCodecName} from './get-codec-name';
import type {LogLevel} from './log-level';
import {Log} from './logger';
import {DEFAULT_COLOR_SPACE, type ColorSpace} from './options/color-space';
import type {X264Preset} from './options/x264-preset';
import type {PixelFormat} from './pixel-format';
import {truthy} from './truthy';

const isAlphaPixelFormat = (pixelFormat: PixelFormat): boolean => {
	return pixelFormat === 'yuva420p' || pixelFormat === 'yuva444p10le';
};

const needsPremultiplyFilter = ({
	codec,
	pixelFormat,
}: {
	codec: Codec;
	pixelFormat: PixelFormat;
}): boolean => {
	// ProRes with alpha channel needs premultiply filter for correct compositing
	// in video editors like OBS, Final Cut Pro, DaVinci Resolve.
	// Chrome/Puppeteer outputs straight (unassociated) alpha, but video editors
	// expect premultiplied (associated) alpha in ProRes 4444.
	// Without this, semi-transparent effects like glows and shadows appear
	// as solid fills instead of soft gradients.
	return codec === 'prores' && isAlphaPixelFormat(pixelFormat);
};

const firstEncodingStepOnly = ({
	hasPreencoded,
	proResProfileName,
	pixelFormat,
	x264Preset,
	codec,
	crf,
	videoBitrate,
	encodingMaxRate,
	encodingBufferSize,
	hardwareAcceleration,
}: {
	hasPreencoded: boolean;
	proResProfileName: string | null;
	pixelFormat: PixelFormat;
	x264Preset: X264Preset | null;
	crf: unknown;
	codec: Codec;
	videoBitrate: string | null;
	encodingMaxRate: string | null;
	encodingBufferSize: string | null;
	hardwareAcceleration: HardwareAccelerationOption;
}): string[][] => {
	if (hasPreencoded || codec === 'gif') {
		return [];
	}

	return [
		proResProfileName ? ['-profile:v', proResProfileName] : null,
		['-pix_fmt', pixelFormat],

		// Without explicitly disabling auto-alt-ref,
		// transparent WebM generation doesn't work
		pixelFormat === 'yuva420p' ? ['-auto-alt-ref', '0'] : null,
		x264Preset ? ['-preset', x264Preset] : null,
		// Apply a fixed a timescale across all environments:
		// https://discord.com/channels/809501355504959528/817306238811111454/1437471619089170613
		['-video_track_timescale', '90000'],
		validateQualitySettings({
			crf,
			videoBitrate,
			codec,
			encodingMaxRate,
			encodingBufferSize,
			hardwareAcceleration,
		}),
	].filter(truthy);
};

export const generateFfmpegArgs = ({
	hasPreencoded,
	proResProfileName,
	pixelFormat,
	x264Preset,
	codec,
	crf,
	videoBitrate,
	encodingMaxRate,
	encodingBufferSize,
	colorSpace,
	hardwareAcceleration,
	indent,
	logLevel,
}: {
	hasPreencoded: boolean;
	proResProfileName: string | null;
	pixelFormat: PixelFormat;
	x264Preset: X264Preset | null;
	crf: unknown;
	codec: Codec;
	videoBitrate: string | null;
	encodingMaxRate: string | null;
	encodingBufferSize: string | null;
	colorSpace: ColorSpace | null;
	hardwareAcceleration: HardwareAccelerationOption;
	indent: boolean;
	logLevel: LogLevel;
}): string[][] => {
	const encoderSettings = getCodecName({
		codec,
		encodingMaxRate,
		encodingBufferSize,
		crf,
		hardwareAcceleration,
		indent,
		logLevel,
	});

	if (encoderSettings === null) {
		throw new TypeError(
			`encoderSettings is null: ${JSON.stringify(codec)} (hwaccel = ${hardwareAcceleration})`,
		);
	}

	const {encoderName, hardwareAccelerated} = encoderSettings;
	if (!hardwareAccelerated && hardwareAcceleration === 'required') {
		throw new Error(
			`Codec ${codec} does not support hardware acceleration on ${process.platform}, but "hardwareAcceleration" is set to "required"`,
		);
	}

	Log.verbose(
		{indent, logLevel, tag: 'stitchFramesToVideo()'},
		`Encoder: ${encoderName}, hardware accelerated: ${hardwareAccelerated}`,
	);

	const resolvedColorSpace = colorSpace ?? DEFAULT_COLOR_SPACE;

	// Build video filter chain - multiple filters are combined with commas
	const videoFilters: string[] = [];

	// Premultiply filter for ProRes with alpha - applied before colorspace
	// conversion so alpha premultiplication happens on the original RGB values
	if (!hasPreencoded && needsPremultiplyFilter({codec, pixelFormat})) {
		videoFilters.push('premultiply=inplace=1');
	}

	// Colorspace conversion filter
	if (!hasPreencoded) {
		if (resolvedColorSpace === 'bt709') {
			// https://www.canva.dev/blog/engineering/a-journey-through-colour-space-with-ffmpeg/
			// "Color range" section
			videoFilters.push('zscale=matrix=709:matrixin=709:range=limited');
		} else if (resolvedColorSpace === 'bt2020-ncl') {
			// BT.2020 also uses the limited range where the digital code value
			// for black is at 16,16,16 and not 0,0,0 in an 8-bit video system.
			videoFilters.push(
				'zscale=matrix=2020_ncl:matrixin=2020_ncl:range=limited',
			);
		}
	}

	const colorSpaceOptions: string[][] =
		resolvedColorSpace === 'bt709'
			? [
					['-colorspace:v', 'bt709'],
					['-color_primaries:v', 'bt709'],
					['-color_trc:v', 'bt709'],
					['-color_range', 'tv'],
				]
			: resolvedColorSpace === 'bt2020-ncl'
				? [
						['-colorspace:v', 'bt2020nc'],
						['-color_primaries:v', 'bt2020'],
						['-color_trc:v', 'arib-std-b67'],
						['-color_range', 'tv'],
					]
				: [];

	// Combine all video filters into single -vf argument
	const videoFilterArg: string[] | null =
		videoFilters.length > 0 ? ['-vf', videoFilters.join(',')] : null;

	return [
		['-c:v', hasPreencoded ? 'copy' : encoderName],
		codec === 'h264-ts' ? ['-f', 'mpegts'] : null,
		// -c:v is the same as -vcodec as -codec:video
		// and specified the video codec.
		...colorSpaceOptions,
		videoFilterArg,
		...firstEncodingStepOnly({
			codec,
			crf,
			hasPreencoded,
			pixelFormat,
			proResProfileName,
			videoBitrate,
			encodingMaxRate,
			encodingBufferSize,
			x264Preset,
			hardwareAcceleration,
		}),
	].filter(truthy);
};
