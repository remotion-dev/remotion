const validCodecs = [
	'h264',
	'h265',
	'vp8',
	'vp9',
	'mp3',
	'aac',
	'wav',
] as const;

export type Codec = typeof validCodecs[number];
export type CodecOrUndefined = Codec | undefined;
const validLegacyFormats = ['mp4', 'png-sequence'] as const;
type LegacyFormat = typeof validLegacyFormats[number];

let codec: CodecOrUndefined = undefined;

export const getOutputCodecOrUndefined = (): CodecOrUndefined => {
	return codec;
};

export const DEFAULT_CODEC: Codec = 'h264';

export const getFinalOutputCodec = ({
	codec: inputCodec,
	fileExtension,
	emitWarning,
}: {
	codec: CodecOrUndefined;
	fileExtension: string | null;
	emitWarning: boolean;
}): Codec => {
	if (inputCodec === undefined && fileExtension === 'webm') {
		if (emitWarning) {
			console.info(
				'You have specified a .webm extension, using the VP8 encoder. Use --codec=vp9 to use the Vp9 encoder.'
			);
		}
		return 'vp8';
	}
	if (inputCodec === undefined && fileExtension === 'hevc') {
		if (emitWarning) {
			console.info(
				'You have specified a .hevc extension, using it using H265 encoder.'
			);
		}
		return 'h265';
	}
	return inputCodec ?? DEFAULT_CODEC;
};

export const setOutputFormat = (newLegacyFormat: LegacyFormat) => {
	if (newLegacyFormat === undefined) {
		codec = undefined;
		return;
	}
	if (!validLegacyFormats.includes(newLegacyFormat)) {
		throw new Error(
			`Output format must be one of the following: ${validLegacyFormats.join(
				', '
			)}, but got ${newLegacyFormat}`
		);
	}
	console.warn(
		'setOutputFormat() is deprecated. Use the setCodec() and setImageSequence() instead.'
	);
	if (newLegacyFormat === 'mp4') {
		codec = 'h264';
		return;
	}
	if (newLegacyFormat === 'png-sequence') {
		codec = undefined;
		return;
	}
};

export const setCodec = (newCodec: CodecOrUndefined) => {
	if (newCodec === undefined) {
		codec = undefined;
		return;
	}
	if (!validCodecs.includes(newCodec)) {
		throw new Error(
			`Codec must be one of the following: ${validCodecs.join(
				', '
			)}, but got ${newCodec}`
		);
	}
	codec = newCodec;
};
