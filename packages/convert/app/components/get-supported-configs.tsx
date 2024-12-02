import {LogLevel, TracksField} from '@remotion/media-parser';
import {
	AudioOperation,
	canCopyAudioTrack,
	canCopyVideoTrack,
	canReencodeAudioTrack,
	canReencodeVideoTrack,
	ConvertMediaContainer,
	getAvailableAudioCodecs,
	getAvailableVideoCodecs,
	VideoOperation,
} from '@remotion/webcodecs';
import {RouteAction} from '~/seo';

export type VideoTrackOption = {
	trackId: number;
	operations: VideoOperation[];
};

export type AudioTrackOption = {
	trackId: number;
	operations: AudioOperation[];
};

export type SupportedConfigs = {
	videoTrackOptions: VideoTrackOption[];
	audioTrackOptions: AudioTrackOption[];
};

const shouldPrioritizeVideoCopyOverReencode = (routeAction: RouteAction) => {
	if (routeAction.type === 'mirror-format') {
		return false;
	}
	if (routeAction.type === 'rotate-format') {
		return false;
	}
	if (routeAction.type === 'generic-mirror') {
		return false;
	}
	if (routeAction.type === 'generic-rotate') {
		return false;
	}
	if (routeAction.type === 'convert') {
		return true;
	}
	if (routeAction.type === 'generic-convert') {
		return true;
	}

	throw new Error('Unsupported route action' + (routeAction satisfies never));
};

export const getSupportedConfigs = async ({
	tracks,
	container,
	bitrate,
	logLevel,
	action,
}: {
	tracks: TracksField;
	container: ConvertMediaContainer;
	bitrate: number;
	logLevel: LogLevel;
	action: RouteAction;
}): Promise<SupportedConfigs> => {
	const availableVideoCodecs = getAvailableVideoCodecs({container});

	const videoTrackOptions: VideoTrackOption[] = [];

	const prioritizeCopyOverReencode =
		shouldPrioritizeVideoCopyOverReencode(action);

	for (const track of tracks.videoTracks) {
		const options: VideoOperation[] = [];
		const canCopy = canCopyVideoTrack({
			inputCodec: track.codecWithoutConfig,
			container,
		});
		if (canCopy && prioritizeCopyOverReencode) {
			options.push({
				type: 'copy',
			});
		}
		for (const outputCodec of availableVideoCodecs) {
			const canReencode = await canReencodeVideoTrack({
				videoCodec: outputCodec,
				track,
			});
			if (canReencode) {
				options.push({
					type: 'reencode',
					videoCodec: outputCodec,
				});
			}
		}
		if (canCopy && !prioritizeCopyOverReencode) {
			options.push({
				type: 'copy',
			});
		}
		options.push({
			type: 'drop',
		});
		videoTrackOptions.push({
			trackId: track.trackId,
			operations: options,
		});
	}

	const availableAudioCodecs = getAvailableAudioCodecs({container});
	const audioTrackOptions: AudioTrackOption[] = [];

	for (const track of tracks.audioTracks) {
		const audioTrackOperations: AudioOperation[] = [];

		const canCopy = canCopyAudioTrack({
			inputCodec: track.codecWithoutConfig,
			container,
		});

		if (canCopy) {
			audioTrackOperations.push({type: 'copy'});
		}

		for (const audioCodec of availableAudioCodecs) {
			const canReencode = await canReencodeAudioTrack({
				audioCodec,
				track,
				bitrate,
				logLevel,
			});

			if (canReencode) {
				audioTrackOperations.push({
					type: 'reencode',
					audioCodec,
					bitrate,
				});
			}
		}
		audioTrackOperations.push({
			type: 'drop',
		});
		audioTrackOptions.push({
			trackId: track.trackId,
			operations: audioTrackOperations,
		});
	}

	return {videoTrackOptions, audioTrackOptions};
};
