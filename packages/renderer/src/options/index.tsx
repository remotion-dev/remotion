import {apiKeyOption} from './api-key';
import {askAIOption} from './ask-ai';
import {audioBitrateOption} from './audio-bitrate';
import {audioCodecOption} from './audio-codec';
import {beepOnFinishOption} from './beep-on-finish';
import {binariesDirectoryOption} from './binaries-directory';
import {browserExecutableOption} from './browser-executable';
import {chromeModeOption} from './chrome-mode';
import {colorSpaceOption} from './color-space';
import {concurrencyOption} from './concurrency';
import {crfOption} from './crf';
import {enableCrossSiteIsolationOption} from './cross-site-isolation';
import {darkModeOption} from './dark-mode';
import {deleteAfterOption} from './delete-after';
import {disableGitSourceOption} from './disable-git-source';
import {disableWebSecurityOption} from './disable-web-security';
import {disallowParallelEncodingOption} from './disallow-parallel-encoding';
import {enableLambdaInsights} from './enable-lambda-insights';
import {enableMultiprocessOnLinuxOption} from './enable-multiprocess-on-linux';
import {encodingBufferSizeOption} from './encoding-buffer-size';
import {encodingMaxRateOption} from './encoding-max-rate';
import {enforceAudioOption} from './enforce-audio';
import {everyNthFrameOption} from './every-nth-frame';
import {experimentalClientSideRenderingOption} from './experimental-client-side-rendering';
import {folderExpiryOption} from './folder-expiry';
import {forSeamlessAacConcatenationOption} from './for-seamless-aac-concatenation';
import {forceNewStudioOption} from './force-new-studio';
import {glOption} from './gl';
import {hardwareAccelerationOption} from './hardware-acceleration';
import {headlessOption} from './headless';
import {ignoreCertificateErrorsOption} from './ignore-certificate-errors';
import {imageSequencePatternOption} from './image-sequence-pattern';
import {ipv4Option} from './ipv4';
import {isProductionOption} from './is-production';
import {jpegQualityOption} from './jpeg-quality';
import {keyboardShortcutsOption} from './keyboard-shortcuts';
import {audioLatencyHintOption} from './latency-hint';
import {licenseKeyOption} from './license-key';
import {logLevelOption} from './log-level';
import {metadataOption} from './metadata';
import {mutedOption} from './mute';
import {numberOfGifLoopsOption} from './number-of-gif-loops';
import {numberOfSharedAudioTagsOption} from './number-of-shared-audio-tags';
import {offthreadVideoCacheSizeInBytesOption} from './offthreadvideo-cache-size';
import {offthreadVideoThreadsOption} from './offthreadvideo-threads';
import {onBrowserDownloadOption} from './on-browser-download';
import type {AnyRemotionOption} from './option';
import {overrideDurationOption} from './override-duration';
import {overrideFpsOption} from './override-fps';
import {overrideHeightOption} from './override-height';
import {overrideWidthOption} from './override-width';
import {overwriteOption} from './overwrite';
import {pixelFormatOption} from './pixel-format';
import {preferLosslessAudioOption} from './prefer-lossless';
import {proResProfileOption} from './prores-profile';
import {publicDirOption} from './public-dir';
import {publicLicenseKeyOption} from './public-license-key';
import {publicPathOption} from './public-path';
import {reproOption} from './repro';
import {scaleOption} from './scale';
import {separateAudioOption} from './separate-audio';
import {stillImageFormatOption} from './still-image-format';
import {throwIfSiteExistsOption} from './throw-if-site-exists';
import {delayRenderTimeoutInMillisecondsOption} from './timeout';
import {userAgentOption} from './user-agent';
import {videoBitrateOption} from './video-bitrate';
import {mediaCacheSizeInBytesOption} from './video-cache-size';
import {videoCodecOption} from './video-codec';
import {videoImageFormatOption} from './video-image-format';
import {webhookCustomDataOption} from './webhook-custom-data';
import {x264Option} from './x264-preset';

export const allOptions = {
	audioCodecOption,
	browserExecutableOption,
	concurrencyOption,
	scaleOption,
	crfOption,
	jpegQualityOption,
	videoBitrateOption,
	audioBitrateOption,
	enforceAudioOption,
	everyNthFrameOption,
	mutedOption,
	videoCodecOption,
	offthreadVideoCacheSizeInBytesOption,
	offthreadVideoThreadsOption,
	webhookCustomDataOption,
	colorSpaceOption,
	deleteAfterOption,
	disableWebSecurityOption,
	disallowParallelEncodingOption,
	folderExpiryOption,
	enableMultiprocessOnLinuxOption,
	glOption,
	enableLambdaInsights,
	encodingMaxRateOption,
	encodingBufferSizeOption,
	beepOnFinishOption,
	numberOfGifLoopsOption,
	reproOption,
	pixelFormatOption,
	preferLosslessOption: preferLosslessAudioOption,
	proResProfileOption,
	x264Option,
	logLevelOption,
	delayRenderTimeoutInMillisecondsOption,
	headlessOption,
	overwriteOption,
	binariesDirectoryOption,
	forSeamlessAacConcatenationOption,
	separateAudioOption,
	publicPathOption,
	publicDirOption,
	onBrowserDownloadOption,
	throwIfSiteExistsOption,
	disableGitSourceOption,
	metadataOption,
	hardwareAccelerationOption,
	chromeModeOption,
	apiKeyOption,
	licenseKeyOption,
	audioLatencyHintOption,
	enableCrossSiteIsolationOption,
	ignoreCertificateErrorsOption,
	imageSequencePatternOption,
	mediaCacheSizeInBytesOption,
	darkModeOption,
	publicLicenseKeyOption,
	isProductionOption,
	askAIOption,
	experimentalClientSideRenderingOption,
	keyboardShortcutsOption,
	forceNewStudioOption,
	numberOfSharedAudioTagsOption,
	ipv4Option,
	stillImageFormatOption,
	userAgentOption,
	videoImageFormatOption,
	overrideHeightOption,
	overrideWidthOption,
	overrideFpsOption,
	overrideDurationOption,
};

export type AvailableOptions = keyof typeof allOptions;
export type TypeOfOption<Type> =
	Type extends AnyRemotionOption<infer X> ? X : never;
