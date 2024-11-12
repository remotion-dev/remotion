import {TracksField} from '@remotion/media-parser';
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

export const getSupportedConfigs = async (
	tracks: TracksField,
	container: ConvertMediaContainer,
	bitrate: number,
): Promise<SupportedConfigs> => {
	const availableVideoCodecs = getAvailableVideoCodecs();

	const videoTrackOptions: VideoTrackOption[] = [];

	for (const track of tracks.videoTracks) {
		const options: VideoOperation[] = [];
		const canCopy = canCopyVideoTrack({
			inputCodec: track.codecWithoutConfig,
			container,
		});
		if (canCopy) {
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
		options.push({
			type: 'drop',
		});
		videoTrackOptions.push({
			trackId: track.trackId,
			operations: options,
		});
	}

	const availableAudioCodecs = getAvailableAudioCodecs();
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
