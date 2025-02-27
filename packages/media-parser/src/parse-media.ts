import {
	defaultSelectM3uAssociatedPlaylists,
	defaultSelectM3uStreamFn,
} from './containers/m3u/select-stream';
import {internalParseMedia} from './internal-parse-media';
import type {ParseMedia} from './options';
import {fetchReader} from './readers/from-fetch';

export const parseMedia: ParseMedia = (options) => {
	return internalParseMedia({
		fields: options.fields ?? null,
		logLevel: options.logLevel ?? 'info',
		onAudioCodec: options.onAudioCodec ?? null,
		onAudioTrack: options.onAudioTrack ?? null,
		onContainer: options.onContainer ?? null,
		onDimensions: options.onDimensions ?? null,
		onDurationInSeconds: options.onDurationInSeconds ?? null,
		onFps: options.onFps ?? null,
		onImages: options.onImages ?? null,
		onInternalStats: options.onInternalStats ?? null,
		onIsHdr: options.onIsHdr ?? null,
		onKeyframes: options.onKeyframes ?? null,
		onLocation: options.onLocation ?? null,
		onMetadata: options.onMetadata ?? null,
		onMimeType: options.onMimeType ?? null,
		onName: options.onName ?? null,
		onNumberOfAudioChannels: options.onNumberOfAudioChannels ?? null,
		onParseProgress: options.onParseProgress ?? null,
		onRotation: options.onRotation ?? null,
		onSampleRate: options.onSampleRate ?? null,
		onSize: options.onSize ?? null,
		onSlowAudioBitrate: options.onSlowAudioBitrate ?? null,
		onSlowDurationInSeconds: options.onSlowDurationInSeconds ?? null,
		onSlowFps: options.onSlowFps ?? null,
		onSlowKeyframes: options.onSlowKeyframes ?? null,
		onSlowNumberOfFrames: options.onSlowNumberOfFrames ?? null,
		onSlowVideoBitrate: options.onSlowVideoBitrate ?? null,
		onStructure: options.onStructure ?? null,
		onM3uStreams: options.onM3uStreams ?? null,
		onTracks: options.onTracks ?? null,
		onUnrotatedDimensions: options.onUnrotatedDimensions ?? null,
		onVideoCodec: options.onVideoCodec ?? null,
		onVideoTrack: options.onVideoTrack ?? null,
		progressIntervalInMs: options.progressIntervalInMs ?? null,
		reader: options.reader ?? fetchReader,
		controller: options.controller ?? undefined,
		selectM3uStream: options.selectM3uStream ?? defaultSelectM3uStreamFn,
		selectM3uAssociatedPlaylists:
			options.selectM3uAssociatedPlaylists ??
			defaultSelectM3uAssociatedPlaylists,
		src: options.src,
		mode: 'query',
		onDiscardedData: null,
		onError: () => ({action: 'fail'}),
		acknowledgeRemotionLicense: Boolean(options.acknowledgeRemotionLicense),
		apiName: 'parseMedia()',
	});
};
