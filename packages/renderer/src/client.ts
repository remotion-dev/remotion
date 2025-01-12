import {DEFAULT_TIMEOUT} from './browser/TimeoutSettings';
import {validCodecs} from './codec';
import {
	codecSupportsCrf,
	codecSupportsVideoBitrate,
} from './codec-supports-media';
import {getDefaultCrfForCodec, getValidCrfRanges} from './crf';
import {defaultFileExtensionMap} from './file-extensions';
import {
	defaultCodecsForFileExtension,
	getFileExtensionFromCodec,
} from './get-extension-from-codec';
import {validStillImageFormats, validVideoImageFormats} from './image-format';
import {DEFAULT_JPEG_QUALITY} from './jpeg-quality';
import {logLevels} from './log-level';
import {allOptions} from './options';
import {
	defaultAudioCodecs,
	getExtensionFromAudioCodec,
	supportedAudioCodecs,
	validAudioCodecs,
} from './options/audio-codec';
import {validChromeModeOptions} from './options/chrome-mode';
import {DEFAULT_COLOR_SPACE, validColorSpaces} from './options/color-space';
import {validOpenGlRenderers} from './options/gl';
import {hardwareAccelerationOptions} from './options/hardware-acceleration';
import {optionsMap} from './options/options-map';
import {getOutputCodecOrUndefined} from './options/video-codec';
import {x264PresetOptions} from './options/x264-preset';
import {
	DEFAULT_PIXEL_FORMAT,
	validPixelFormats,
	validPixelFormatsForCodec,
} from './pixel-format';
import {proResProfileOptions} from './prores-profile';
import {validateOutputFilename} from './validate-output-filename';
export {AvailableOptions, TypeOfOption} from './options';
export {HardwareAccelerationOption} from './options/hardware-acceleration';

export const BrowserSafeApis = {
	getFileExtensionFromCodec,
	validCodecs,
	validAudioCodecs,
	getDefaultCrfForCodec,
	getValidCrfRanges,
	proResProfileOptions,
	x264PresetOptions,
	hardwareAccelerationOptions,
	validPixelFormats,
	validOpenGlRenderers,
	validPixelFormatsForCodec,
	validVideoImageFormats,
	validStillImageFormats,
	DEFAULT_PIXEL_FORMAT,
	DEFAULT_TIMEOUT,
	DEFAULT_JPEG_QUALITY,
	DEFAULT_COLOR_SPACE,
	supportedAudioCodecs,
	defaultFileExtensionMap,
	defaultAudioCodecs,
	defaultCodecsForFileExtension,
	validateOutputFilename,
	options: allOptions,
	validColorSpaces,
	optionsMap,
	codecSupportsCrf,
	codecSupportsVideoBitrate,
	logLevels,
	getOutputCodecOrUndefined,
	getExtensionFromAudioCodec,
	validChromeModeOptions,
};
