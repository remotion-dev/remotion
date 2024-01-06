import type {Codec} from './codec';
import {validateQualitySettings} from './crf';
import {getCodecName} from './get-codec-name';
import type {ColorSpace} from './options/color-space';
import type {PixelFormat} from './pixel-format';
import {truthy} from './truthy';
import type {X264Preset} from './x264-preset';

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
	colorSpace: ColorSpace;
}): string[][] => {
	const encoderName = getCodecName(codec);

	if (encoderName === null) {
		throw new TypeError('encoderName is null: ' + JSON.stringify(codec));
	}

	const colorSpaceOptions: string[][] =
		colorSpace === 'bt709'
			? [
					['-colorspace:v', 'bt709'],
					['-color_primaries:v', 'bt709'],
					['-color_trc:v', 'bt709'],
					['-color_range', 'tv'],
					hasPreencoded ? [] : ['-vf', 'zscale=m=709:min=709:r=limited'],
				]
			: [];

	return [
		['-c:v', hasPreencoded ? 'copy' : encoderName],
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
