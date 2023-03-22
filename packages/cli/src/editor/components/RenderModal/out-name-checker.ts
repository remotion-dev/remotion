import type {AudioCodec, Codec, StillImageFormat} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import type {RenderType} from './RenderModalAdvanced';

export const invalidCharacters = ['?', '*', '+', ':', '%'];

const isValidStillExtension = (
	extension: string,
	stillImageFormat: StillImageFormat
): boolean => {
	if (stillImageFormat === 'jpeg' && extension === 'jpg') {
		return true;
	}

	return extension === stillImageFormat;
};

export const validateOutnameGui = ({
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
	stillImageFormat: StillImageFormat | null;
}): {valid: true} | {valid: false; error: Error} => {
	try {
		isValidOutName({
			audioCodec,
			codec,
			outName,
			renderMode,
			stillImageFormat,
		});
		return {valid: true};
	} catch (err) {
		return {valid: false, error: err as Error};
	}
};

const isValidOutName = ({
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
	stillImageFormat: StillImageFormat | null;
}): void => {
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
		BrowserSafeApis.validateOutputFilename({
			codec,
			audioCodec: audioCodec ?? null,
			extension,
			preferLossless: false,
		});
	}

	if (prefix.length < 1) {
		throw new Error('The prefix must be at least 1 character long');
	}

	if (prefix[0] === '.') {
		throw new Error('The output name must not start with a dot');
	}

	if (hasInvalidChar()) {
		throw new Error(
			"Filename can't contain the following characters:  ?, *, +, %, :"
		);
	}

	if (
		renderMode === 'still' &&
		stillImageFormat &&
		!isValidStillExtension(extension, stillImageFormat)
	) {
		throw new Error(
			`The extension ${extension} is not supported for still image format ${stillImageFormat}`
		);
	}

	if (renderMode === 'audio') {
		if (audioCodec === 'pcm-16') {
			if (extension !== 'wav' && extension !== 'wave') {
				throw new Error(
					`The extension ${extension} is not supported for audio codec ${audioCodec}`
				);
			}
		}

		if (audioCodec !== extension) {
			throw new Error(
				`The extension ${extension} is not supported for audio codec ${audioCodec}`
			);
		}
	}
};
