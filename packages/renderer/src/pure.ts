import {getFileExtensionFromCodec} from './get-extension-from-codec';
import {getExtensionOfFilename} from './get-extension-of-filename';
import {validateOutputFilename} from './validate-output-filename';
import {wrapWithErrorHandling} from './wrap-with-error-handling';

export const PureJSAPIs = {
	wrapWithErrorHandling,
	getExtensionOfFilename,
	getFileExtensionFromCodec,
	validateOutputFilename,
};
