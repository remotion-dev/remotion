import {codecSupportsMedia} from './codec-supports-media';
import {getFramesToRender} from './get-duration-from-frame-range';
import {getFileExtensionFromCodec} from './get-extension-from-codec';
import {getExtensionOfFilename} from './get-extension-of-filename';
import {isAudioCodec} from './is-audio-codec';
import {validateOutputFilename} from './validate-output-filename';

export const NoReactAPIs = {
	getExtensionOfFilename,
	getFileExtensionFromCodec,
	validateOutputFilename,
	getFramesToRender,
	codecSupportsMedia,
	isAudioCodec,
};
