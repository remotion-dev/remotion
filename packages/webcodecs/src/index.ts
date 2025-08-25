import {
	normalizeVideoRotation,
	rotateAndResizeVideoFrame,
} from './rotate-and-resize-video-frame';
import {calculateNewDimensionsFromRotateAndScale} from './rotation';
import {setRemotionImported} from './set-remotion-imported';

export {createAudioEncoder} from './audio-encoder';
export type {WebCodecsAudioEncoder} from './audio-encoder';
export {canCopyAudioTrack} from './can-copy-audio-track';
export {canCopyVideoTrack} from './can-copy-video-track';
export {canReencodeAudioTrack} from './can-reencode-audio-track';
export {canReencodeVideoTrack} from './can-reencode-video-track';
export {convertAudioData, ConvertAudioDataOptions} from './convert-audiodata';
export {convertMedia} from './convert-media';
export type {
	ConvertMediaOnAudioData,
	ConvertMediaOnProgress,
	ConvertMediaOnVideoFrame,
	ConvertMediaProgress,
	ConvertMediaResult,
} from './convert-media';
export {createAudioDecoder} from './create-audio-decoder';
export type {WebCodecsAudioDecoder} from './create-audio-decoder';
export {createVideoDecoder} from './create-video-decoder';
export type {WebCodecsVideoDecoder} from './create-video-decoder';
export {defaultOnAudioTrackHandler} from './default-on-audio-track-handler';
export {defaultOnVideoTrackHandler} from './default-on-video-track-handler';
export {
	extractFrames,
	ExtractFrames,
	ExtractFramesProps,
} from './extract-frames';
export {getAvailableAudioCodecs} from './get-available-audio-codecs';
export type {ConvertMediaAudioCodec} from './get-available-audio-codecs';
export {getAvailableContainers} from './get-available-containers';
export type {ConvertMediaContainer} from './get-available-containers';
export {getAvailableVideoCodecs} from './get-available-video-codecs';
export type {ConvertMediaVideoCodec} from './get-available-video-codecs';
export {getDefaultAudioCodec} from './get-default-audio-codec';
export {getDefaultVideoCodec} from './get-default-video-codec';
export {
	getPartialAudioData,
	GetPartialAudioDataProps,
} from './get-partial-audio-data';
export type {ExtractFramesTimestampsInSecondsFn} from './internal-extract-frames';
export type {
	AudioOperation,
	ConvertMediaOnAudioTrackHandler,
} from './on-audio-track-handler';
export type {
	ConvertMediaOnVideoTrackHandler,
	VideoOperation,
} from './on-video-track-handler';
export type {ResizeOperation} from './resizing/mode';
export {rotateAndResizeVideoFrame} from './rotate-and-resize-video-frame';
export {
	AudioUndecodableError,
	VideoUndecodableError,
} from './undecodable-error';
export {createVideoEncoder} from './video-encoder';
export type {WebCodecsVideoEncoder} from './video-encoder';
export {webcodecsController} from './webcodecs-controller';
export type {WebCodecsController} from './webcodecs-controller';

export const WebCodecsInternals = {
	rotateAndResizeVideoFrame,
	normalizeVideoRotation,
	calculateNewDimensionsFromDimensions:
		calculateNewDimensionsFromRotateAndScale,
};

setRemotionImported();
