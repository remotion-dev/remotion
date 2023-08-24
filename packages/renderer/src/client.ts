import {
	defaultAudioCodecs,
	supportedAudioCodecs,
	validAudioCodecs,
} from './audio-codec';
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
import {isAudioCodec} from './is-audio-codec';
import {audioBitrateOption} from './options/audio-bitrate';
import {crfOption} from './options/crf';
import {enforceAudioOption} from './options/enforce-audio';
import {jpegQualityOption} from './options/jpeg-quality';
import {muteOption} from './options/mute';
import {offthreadVideoCacheSizeInBytesOption} from './options/offthreadvideo-cache-size';
import {optionsMap} from './options/options-map';
import {scaleOption} from './options/scale';
import {videoBitrate} from './options/video-bitrate';
import {videoCodecOption} from './options/video-codec';
import {webhookCustomDataOption} from './options/webhook-custom-data';
import {DEFAULT_PIXEL_FORMAT, validPixelFormats} from './pixel-format';
import {proResProfileOptions} from './prores-profile';
import {validateOutputFilename} from './validate-output-filename';
import {x264PresetOptions} from './x264-preset';

export const BrowserSafeApis = {
	getFileExtensionFromCodec,
	validCodecs,
	validAudioCodecs,
	getDefaultCrfForCodec,
	getValidCrfRanges,
	isAudioCodec,
	proResProfileOptions,
	x264PresetOptions,
	validPixelFormats,
	DEFAULT_PIXEL_FORMAT,
	supportedAudioCodecs,
	defaultFileExtensionMap,
	defaultAudioCodecs,
	defaultCodecsForFileExtension,
	validateOutputFilename,
	options: {
		scaleOption,
		crfOption,
		jpegQualityOption,
		videoBitrate,
		audioBitrateOption,
		enforceAudioOption,
		muteOption,
		videoCodecOption,
		offthreadVideoCacheSizeInBytesOption,
		webhookCustomDataOption,
	},
	optionsMap,
	codecSupportsCrf,
	codecSupportsVideoBitrate,
};
