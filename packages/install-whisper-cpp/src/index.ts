export {ConvertToCaptionCaption} from './convert-to-captions';
export type {OnProgress} from './download';
export {downloadWhisperModel, WhisperModel} from './download-whisper-model';
export {installWhisperCpp} from './install-whisper-cpp';
export type {Language} from './languages';
export {toCaptions} from './to-captions';
export {
	transcribe,
	TranscribeOnProgress,
	TranscriptionJson,
} from './transcribe';

import {convertToCaptions as deprecatedConvertToCaptions} from './convert-to-captions';

/**
 *
 * @deprecated convertToCaptions() has been deprecated as of Remotion v4.0.216.
 * Use the toCaptions() function instead.
 */
export const convertToCaptions = deprecatedConvertToCaptions;
