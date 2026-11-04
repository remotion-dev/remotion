import type {AudioCodec, Codec, StillImageFormat} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import type {RenderType} from './RenderModalAdvanced';

const invalidCharacters = ['?', '*', '+', ':', '%'];

export const hasInvalidOutputDotSegment = (outName: string): boolean => {
	let filename = '';
	for (const segment of outName.split('/')) {
		if (segment === '.' || segment === '..') {
			return true;
		}

		if (segment !== '') {
			filename = segment;
		}
	}

	return filename.startsWith('.');
};

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
	const extension = BrowserSafeApis.getExtensionOfFilename(outName);
	const prefix =
		extension === null
			? outName
			: outName.substring(0, outName.length - extension.length - 1);

	const map = BrowserSafeApis.defaultFileExtensionMap[codec];

	if (
		BrowserSafeApis.supportedAudioCodecs[codec].length > 0 &&
		!(audioCodec in map.forAudioCodec)
	) {
		throw new Error(
			`Audio codec ${audioCodec} is not supported for codec ${codec}`,
		);
	}

	const hasInvalidChar = () => {
		return prefix.split('').some((char) => invalidCharacters.includes(char));
	};

	if (renderMode === 'video' || renderMode === 'audio') {
		BrowserSafeApis.validateOutputFilename({
			codec,
			audioCodecSetting: audioCodec ?? null,
			extension: extension ?? '',
			preferLossless: false,
			separateAudioTo,
		});
	}

	if (prefix.length < 1 && renderMode !== 'sequence') {
		throw new Error('The prefix must be at least 1 character long');
	}

	if (hasInvalidOutputDotSegment(outName)) {
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
		!isValidStillExtension(extension ?? '', stillImageFormat)
	) {
		throw new Error(
			`The extension ${extension ?? ''} is not supported for still image format ${stillImageFormat}`,
		);
	}

	if (renderMode === 'sequence') {
		if (extension !== null) {
			throw new Error('The image sequence folder must not have an extension');
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

	const hasInvalidChar = () => {
		return prefix.split('').some((char) => invalidCharacters.includes(char));
	};

	if (prefix.length < 1) {
		throw new Error('The prefix must be at least 1 character long');
	}

	if (hasInvalidOutputDotSegment(separateAudioTo)) {
		throw new Error('The output name must not start with a dot');
	}

	if (hasInvalidChar()) {
		throw new Error(
			"Filename can't contain the following characters:  ?, *, +, %, :",
		);
	}
};
