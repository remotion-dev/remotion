import {validCodecs} from './codec';
import {getDefaultCrfForCodec, getValidCrfRanges} from './crf';
import {getFileExtensionFromCodec} from './get-extension-from-codec';

export const BrowserSafeApis = {
	getFileExtensionFromCodec,
	validCodecs,
	getDefaultCrfForCodec,
	getValidCrfRanges,
};
