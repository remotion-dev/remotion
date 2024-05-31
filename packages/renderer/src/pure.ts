import {getFileExtensionFromCodec} from './get-extension-from-codec';
import {getExtensionOfFilename} from './get-extension-of-filename';
import {makeStreamPayloadMessage, makeStreamer} from './streaming';
import {validateOutputFilename} from './validate-output-filename';
import {wrapWithErrorHandling} from './wrap-with-error-handling';

export const NoReactAPIs = {
	wrapWithErrorHandling,
	getExtensionOfFilename,
	getFileExtensionFromCodec,
	validateOutputFilename,
	makeStreamer,
	makeStreamPayloadMessage,
};
