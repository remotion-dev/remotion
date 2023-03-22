import type {AudioCodec, Codec, StillImageFormat} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import type {RenderType} from './RenderModalAdvanced';

export const invalidCharacters = ['?', '*', '+', ':', '%'];

const isValidStillExtension = (
	extension: string,
	stillImageFormat: StillImageFormat
): boolean => {
	if (stillImageFormat === 'jpeg') {
		if (extension === 'jpg') {
			return true;
		}
	}

	return extension === stillImageFormat;
};

export const isValidOutName = ({
	outName,
	codec,
	audioCodec,
	renderMode,
	stillImageFormat,
}: {
	outName: string;
	codec: Codec;
	audioCodec: AudioCodec;
	renderMode: RenderType;
	stillImageFormat?: StillImageFormat;
}): boolean => {
	const extension = outName.substring(outName.lastIndexOf('.') + 1);
	const prefix = outName.substring(0, outName.lastIndexOf('.'));

	const map = BrowserSafeApis.defaultFileExtensionMap[codec];

	if (!(audioCodec in map.forAudioCodec)) {
		throw new Error(
			`Audio codec ${audioCodec} is not supported for codec ${codec}`
		);
	}

	const hasInvalidChar = () => {
		return prefix.split('').some((char) => invalidCharacters.includes(char));
	};

	if (renderMode === 'video') {
		try {
			BrowserSafeApis.validateOutputFilename({
				codec,
				audioCodec: audioCodec ?? null,
				extension,
				preferLossless: false,
			});
		} catch (e) {
			return false;
		}
	}

	if (prefix.length < 1) {
		return false;
	}

	if (prefix[0] === '.') {
		return false;
	}

	if (hasInvalidChar()) {
		return false;
	}

	if (renderMode === 'still' && stillImageFormat) {
		return isValidStillExtension(extension, stillImageFormat);
	}

	if (renderMode === 'audio') {
		if (audioCodec === 'pcm-16') {
			return extension === 'wav' || extension === 'wave';
		}

		return audioCodec === extension;
	}

	return true;
};
