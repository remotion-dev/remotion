import type {
	MediaParserAudioCodec,
	MediaParserContainer,
	MediaParserTrack,
} from '@remotion/media-parser';
import type {
	AudioOperation,
	ConvertMediaContainer,
	ResizeOperation,
	VideoOperation,
} from '@remotion/webcodecs';
import {
	canCopyAudioTrack,
	canCopyVideoTrack,
	canReencodeAudioTrack,
	canReencodeVideoTrack,
	getAvailableAudioCodecs,
	getAvailableVideoCodecs,
} from '@remotion/webcodecs';
import type {RouteAction} from '~/seo';

export type VideoTrackOption = {
	trackId: number;
	operations: VideoOperation[];
};

export type AudioTrackOption = {
	trackId: number;
	operations: AudioOperation[];
	audioCodec: MediaParserAudioCodec;
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

	if (routeAction.type === 'generic-probe') {
		return true;
	}

	if (routeAction.type === 'generic-resize') {
		return false;
	}

	if (routeAction.type === 'resize-format') {
		return false;
	}

	if (routeAction.type === 'report') {
		return false;
	}

	if (routeAction.type === 'transcribe') {
		return false;
	}

	throw new Error('Unsupported route action' + (routeAction satisfies never));
};

export const getSupportedConfigs = async ({
	tracks,
	container,
	bitrate,
	action,
	userRotation,
	inputContainer,
	resizeOperation,
	sampleRate,
}: {
	tracks: MediaParserTrack[];
	container: ConvertMediaContainer;
	bitrate: number;
	action: RouteAction;
	userRotation: number;
	inputContainer: MediaParserContainer;
	resizeOperation: ResizeOperation | null;
	sampleRate: number | null;
}): Promise<SupportedConfigs> => {
	const availableVideoCodecs = getAvailableVideoCodecs({container});

	const videoTrackOptions: VideoTrackOption[] = [];

	const prioritizeCopyOverReencode =
		shouldPrioritizeVideoCopyOverReencode(action);

	for (const track of tracks.filter((t) => t.type === 'video')) {
		const options: VideoOperation[] = [];
		const canCopy = canCopyVideoTrack({
			inputTrack: track,
			outputContainer: container,
			rotationToApply: userRotation,
			inputContainer,
			resizeOperation,
			outputVideoCodec: null,
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
				resizeOperation,
				rotate: userRotation,
			});
			if (canReencode) {
				options.push({
					type: 'reencode',
					videoCodec: outputCodec,
					resize: resizeOperation,
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

	for (const track of tracks.filter((t) => t.type === 'audio')) {
		const audioTrackOperations: AudioOperation[] = [];

		const canCopy = canCopyAudioTrack({
			inputCodec: track.codecEnum,
			outputContainer: container,
			inputContainer,
			outputAudioCodec: null,
		});

		if (canCopy) {
			audioTrackOperations.push({type: 'copy'});
		}

		for (const audioCodec of availableAudioCodecs) {
			const canReencode = await canReencodeAudioTrack({
				audioCodec,
				track,
				bitrate,
				sampleRate,
			});

			if (canReencode) {
				audioTrackOperations.push({
					type: 'reencode',
					audioCodec,
					bitrate,
					sampleRate,
				});
			}
		}

		audioTrackOperations.push({
			type: 'drop',
		});
		audioTrackOptions.push({
			trackId: track.trackId,
			operations: audioTrackOperations,
			audioCodec: track.codecEnum,
		});
	}

	return {videoTrackOptions, audioTrackOptions};
};
