import type {Codec} from './codec';
import {validateQualitySettings} from './crf';
import {getCodecName} from './get-codec-name';
import {DEFAULT_COLOR_SPACE, type ColorSpace} from './options/color-space';
import type {X264Preset} from './options/x264-preset';
import type {PixelFormat} from './pixel-format';
import {truthy} from './truthy';

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
		validateQualitySettings({
			crf,
			videoBitrate,
			codec,
			encodingMaxRate,
			encodingBufferSize,
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
}): string[][] => {
	const encoderName = getCodecName(codec);

	if (encoderName === null) {
		throw new TypeError('encoderName is null: ' + JSON.stringify(codec));
	}

	const resolvedColorSpace: ColorSpace =
		codec === 'gif' ? 'bt601' : colorSpace ?? DEFAULT_COLOR_SPACE;

	const colorSpaceOptions: string[][] =
		resolvedColorSpace === 'bt709'
			? [
					['-colorspace:v', 'bt709'],
					['-color_primaries:v', 'bt709'],
					['-color_trc:v', 'bt709'],
					['-color_range', 'tv'],
					hasPreencoded
						? []
						: // https://www.canva.dev/blog/engineering/a-journey-through-colour-space-with-ffmpeg/
							// "Color range" section
							['-vf', 'zscale=matrix=709:matrixin=709:range=limited'],
				]
			: resolvedColorSpace === 'bt2020-ncl'
				? [
						['-colorspace:v', 'bt2020nc'],
						['-color_primaries:v', 'bt2020'],
						['-color_trc:v', 'arib-std-b67'],
						['-color_range', 'tv'],
						hasPreencoded
							? []
							: [
									'-vf',
									// ChatGPT: Therefore, just like BT.709, BT.2020 also uses the limited range where the digital code value for black is at 16,16,16 and not 0,0,0 in an 8-bit video system.
									'zscale=matrix=2020_ncl:matrixin=2020_ncl:range=limited',
								],
					]
				: [];

	return [
		['-c:v', hasPreencoded ? 'copy' : encoderName],
		codec === 'h264-ts' ? ['-f', 'mpegts'] : null,
		// -c:v is the same as -vcodec as -codec:video
		// and specified the video codec.
		...colorSpaceOptions,
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
		}),
	].filter(truthy);
};
