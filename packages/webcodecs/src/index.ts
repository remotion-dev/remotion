import {setRemotionImported} from './set-remotion-imported';

export {createAudioDecoder, WebCodecsAudioDecoder} from './audio-decoder';
export {createAudioEncoder, WebCodecsAudioEncoder} from './audio-encoder';
export {canCopyAudioTrack} from './can-copy-audio-track';
export {canCopyVideoTrack} from './can-copy-video-track';
export {canReencodeAudioTrack} from './can-reencode-audio-track';
export {canReencodeVideoTrack} from './can-reencode-video-track';
export {
	ConvertMediaAudioCodec,
	ConvertMediaVideoCodec,
	getAvailableAudioCodecs,
	getAvailableVideoCodecs,
} from './codec-id';
export {
	convertMedia,
	ConvertMediaOnProgress,
	ConvertMediaOnVideoFrame,
	ConvertMediaProgress,
	ConvertMediaResult,
} from './convert-media';
export {defaultOnAudioTrackHandler} from './default-on-audio-track-handler';
export {defaultOnVideoTrackHandler} from './default-on-video-track-handler';
export {
	ConvertMediaContainer,
	getAvailableContainers,
} from './get-available-containers';
export {getDefaultAudioCodec} from './get-default-audio-codec';
export {getDefaultVideoCodec} from './get-default-video-codec';
export {
	AudioOperation,
	ConvertMediaOnAudioTrackHandler,
} from './on-audio-track-handler';
export {
	ConvertMediaOnVideoTrackHandler,
	VideoOperation,
} from './on-video-track-handler';
export {createVideoDecoder, WebCodecsVideoDecoder} from './video-decoder';
export {createVideoEncoder, WebCodecsVideoEncoder} from './video-encoder';

setRemotionImported();
