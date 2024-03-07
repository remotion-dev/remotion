import type {AudioCodec, Codec, StillImageFormat} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import type {RenderType} from './RenderModalAdvanced';

const invalidCharacters = ['?', '*', '+', ':', '%'];

const isValidStillExtension = (
	extension: string,
	stillImageFormat: StillImageFormat,
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
	separateAudioTo,
}: {
	outName: string;
	codec: Codec;
	audioCodec: AudioCodec;
	renderMode: RenderType;
	stillImageFormat: StillImageFormat | null;
	separateAudioTo: string | null;
}): {valid: true} | {valid: false; error: Error} => {
	try {
		isValidOutName({
			audioCodec,
			codec,
			outName,
			renderMode,
			stillImageFormat,
			separateAudioTo,
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
	separateAudioTo,
}: {
	outName: string;
	codec: Codec;
	audioCodec: AudioCodec;
	renderMode: RenderType;
	stillImageFormat: StillImageFormat | null;
	separateAudioTo: string | null;
}): void => {
	const extension = outName.substring(outName.lastIndexOf('.') + 1);
	const prefix = outName.substring(0, outName.lastIndexOf('.'));

	const map = BrowserSafeApis.defaultFileExtensionMap[codec];

	if (
		BrowserSafeApis.supportedAudioCodecs[codec].length > 0 &&
		!(audioCodec in map.forAudioCodec)
	) {
		throw new Error(
			`Audio codec ${audioCodec} is not supported for codec ${codec}`,
		);
	}

	const hasDotAfterSlash = () => {
		const substrings = prefix.split('/');
		for (const str of substrings) {
			if (str[0] === '.') {
				return true;
			}
		}

		return false;
	};

	const hasInvalidChar = () => {
		return prefix.split('').some((char) => invalidCharacters.includes(char));
	};

	if (renderMode === 'video' || renderMode === 'audio') {
		BrowserSafeApis.validateOutputFilename({
			codec,
			audioCodecSetting: audioCodec ?? null,
			extension,
			preferLossless: false,
			separateAudioTo,
		});
	}

	if (prefix.length < 1 && renderMode !== 'sequence') {
		throw new Error('The prefix must be at least 1 character long');
	}

	if (prefix[0] === '.' || hasDotAfterSlash()) {
		throw new Error('The output name must not start with a dot');
	}

	if (hasInvalidChar()) {
		throw new Error(
			"Filename can't contain the following characters:  ?, *, +, %, :",
		);
	}

	if (
		renderMode === 'still' &&
		stillImageFormat &&
		!isValidStillExtension(extension, stillImageFormat)
	) {
		throw new Error(
			`The extension ${extension} is not supported for still image format ${stillImageFormat}`,
		);
	}

	if (renderMode === 'sequence') {
		if (outName.includes('.')) {
			throw new Error('Folder names must not contain a dot');
		}
	}
};

export const isValidSeparateAudioName = ({
	audioCodec,
	separateAudioTo,
}: {
	separateAudioTo: string;
	audioCodec: AudioCodec;
}): void => {
	const prefix = separateAudioTo.substring(0, separateAudioTo.lastIndexOf('.'));

	const expectedExtension =
		BrowserSafeApis.getExtensionFromAudioCodec(audioCodec);
	const actualExtension = separateAudioTo.split('.').pop();
	if (actualExtension !== expectedExtension) {
		throw new Error(`Expected extension: .${expectedExtension}`);
	}

	const hasDotAfterSlash = () => {
		const substrings = prefix.split('/');
		for (const str of substrings) {
			if (str[0] === '.') {
				return true;
			}
		}

		return false;
	};

	const hasInvalidChar = () => {
		return prefix.split('').some((char) => invalidCharacters.includes(char));
	};

	if (prefix.length < 1) {
		throw new Error('The prefix must be at least 1 character long');
	}

	if (prefix[0] === '.' || hasDotAfterSlash()) {
		throw new Error('The output name must not start with a dot');
	}

	if (hasInvalidChar()) {
		throw new Error(
			"Filename can't contain the following characters:  ?, *, +, %, :",
		);
	}
};
