import {
	defaultAudioCodecs,
	supportedAudioCodecs,
	validAudioCodecs,
} from './audio-codec';
import {validCodecs} from './codec';
import {getDefaultCrfForCodec, getValidCrfRanges} from './crf';
import {defaultFileExtensionMap} from './file-extensions';
import {
	defaultCodecsForFileExtension,
	getFileExtensionFromCodec,
} from './get-extension-from-codec';
import {isAudioCodec} from './is-audio-codec';
import {crfOption} from './options/crf';
import {scaleOption} from './options/scale';
import {DEFAULT_PIXEL_FORMAT, validPixelFormats} from './pixel-format';
import {proResProfileOptions} from './prores-profile';

export const BrowserSafeApis = {
	getFileExtensionFromCodec,
	validCodecs,
	validAudioCodecs,
	getDefaultCrfForCodec,
	getValidCrfRanges,
	isAudioCodec,
	proResProfileOptions,
	validPixelFormats,
	DEFAULT_PIXEL_FORMAT,
	supportedAudioCodecs,
	defaultFileExtensionMap,
	defaultAudioCodecs,
	defaultCodecsForFileExtension,
	options: {
		scaleOption,
		crfOption,
	},
};
