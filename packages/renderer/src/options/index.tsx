import {audioBitrateOption} from './audio-bitrate';
import {beepOnFinishOption} from './beep-on-finish';
import {colorSpaceOption} from './color-space';
import {crfOption} from './crf';
import {deleteAfterOption} from './delete-after';
import {enableLambdaInsights} from './enable-lambda-insights';
import {enableMultiprocessOnLinuxOption} from './enable-multiprocess-on-linux';
import {encodingBufferSizeOption} from './encoding-buffer-size';
import {encodingMaxRateOption} from './encoding-max-rate';
import {enforceAudioOption} from './enforce-audio';
import {folderExpiryOption} from './folder-expiry';
import {glOption} from './gl';
import {jpegQualityOption} from './jpeg-quality';
import {muteOption} from './mute';
import {numberOfGifLoopsOption} from './number-of-gif-loops';
import {offthreadVideoCacheSizeInBytes} from './offthreadvideo-cache-size';
import type {AnyRemotionOption} from './option';
import {reproOption} from './repro';
import {scaleOption} from './scale';
import {videoBitrate} from './video-bitrate';
import {videoCodecOption} from './video-codec';
import {webhookCustomDataOption} from './webhook-custom-data';
import {x264Option} from './x264-preset';

export const allOptions = {
	scaleOption,
	crfOption,
	jpegQualityOption,
	videoBitrate,
	audioBitrateOption,
	enforceAudioOption,
	muteOption,
	videoCodecOption,
	offthreadVideoCacheSizeInBytes,
	webhookCustomDataOption,
	colorSpaceOption,
	deleteAfterOption,
	folderExpiryOption,
	enableMultiprocessOnLinuxOption,
	glOption,
	enableLambdaInsights,
	encodingMaxRateOption,
	encodingBufferSizeOption,
	beepOnFinishOption,
	numberOfGifLoopsOption,
	reproOption,
	x264Option,
};

export type AvailableOptions = keyof typeof allOptions;
export type TypeOfOption<Type> = Type extends AnyRemotionOption<infer X>
	? X
	: never;
