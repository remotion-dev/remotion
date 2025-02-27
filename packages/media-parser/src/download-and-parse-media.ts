import {
	defaultSelectM3uAssociatedPlaylists,
	defaultSelectM3uStreamFn,
} from './containers/m3u/select-stream';
import {internalParseMedia} from './internal-parse-media';
import {Log} from './log';
import type {DownloadAndParseMedia} from './options';
import {fetchReader} from './readers/from-fetch';

export const downloadAndParseMedia: DownloadAndParseMedia = async (options) => {
	const logLevel = options.logLevel ?? 'info';
	const content = await options.writer.createContent({
		filename: 'hmm',
		mimeType: 'shouldnotmatter',
		logLevel,
	});
	const returnValue = await internalParseMedia({
		fields: options.fields ?? null,
		logLevel,
		mode: 'download',
		onAudioCodec: options.onAudioCodec ?? null,
		onAudioTrack: null,
		onContainer: options.onContainer ?? null,
		onDimensions: options.onDimensions ?? null,
		selectM3uStream: options.selectM3uStream ?? defaultSelectM3uStreamFn,
		selectM3uAssociatedPlaylists:
			options.selectM3uAssociatedPlaylists ??
			defaultSelectM3uAssociatedPlaylists,
		onDiscardedData: async (data) => {
			await content.write(data);
		},
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
		onVideoTrack: null,
		progressIntervalInMs: options.progressIntervalInMs ?? null,
		reader: options.reader ?? fetchReader,
		controller: options.controller ?? undefined,
		src: options.src,
		onError: async (err) => {
			const action = (await options.onError?.(err)) ?? {action: 'fail'};
			if (action.action === 'fail') {
				Log.verbose(logLevel, 'Removing content');
				await content.finish();
				await content.remove();
			}

			return action;
		},
		acknowledgeRemotionLicense: Boolean(options.acknowledgeRemotionLicense),
		apiName: 'parseAndDownloadMedia()',
	});
	await content.finish();
	return returnValue;
};
