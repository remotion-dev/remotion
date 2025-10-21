import type {InputAudioTrack, InputTrack, OutputFormat} from 'mediabunny';
import type {AudioOperation, VideoOperation} from '~/lib/audio-operation';
import {
	canCopyAudioTrack,
	canCopyVideoTrack,
	getAudioTranscodingOptions,
	getVideoTranscodingOptions,
} from '~/lib/can-transcode-or-copy';
import type {MediabunnyResize} from '~/lib/mediabunny-calculate-resize-option';
import type {RouteAction} from '~/seo';

export type VideoTrackOption = {
	trackId: number;
	operations: VideoOperation[];
};

export type AudioTrackOption = {
	trackId: number;
	operations: AudioOperation[];
	audioCodec: InputAudioTrack['codec'];
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

	if (routeAction.type === 'generic-crop') {
		return false;
	}

	if (routeAction.type === 'crop-format') {
		return false;
	}

	throw new Error('Unsupported route action' + (routeAction satisfies never));
};

export const getSupportedConfigs = async ({
	tracks,
	container,
	action,
	userRotation,
	resizeOperation,
	sampleRate,
}: {
	tracks: InputTrack[];
	container: OutputFormat;
	action: RouteAction;
	userRotation: number;
	resizeOperation: MediabunnyResize | null;
	sampleRate: number | null;
}): Promise<SupportedConfigs> => {
	const audioTrackOptions: AudioTrackOption[] = [];
	const videoTrackOptions: VideoTrackOption[] = [];

	const prioritizeCopyOverReencode =
		shouldPrioritizeVideoCopyOverReencode(action);

	for (const track of tracks) {
		if (track.isVideoTrack()) {
			const options: VideoOperation[] = [];
			const canCopy = canCopyVideoTrack({
				inputTrack: track,
				outputContainer: container,
				rotationToApply: userRotation,
				resizeOperation,
			});
			if (canCopy && prioritizeCopyOverReencode) {
				options.push({
					type: 'copy',
				});
			}

			const reencodeOptions = await getVideoTranscodingOptions({
				inputTrack: track,
				outputContainer: container,
				resizeOperation,
				rotate: userRotation,
			});
			options.push(...reencodeOptions);

			if (canCopy && !prioritizeCopyOverReencode) {
				options.push({
					type: 'copy',
				});
			}

			options.push({
				type: 'drop',
			});
			videoTrackOptions.push({
				trackId: track.id,
				operations: options,
			});
		}

		if (track.isAudioTrack()) {
			const audioTrackOperations: AudioOperation[] = [];

			const canCopy = canCopyAudioTrack({
				outputContainer: container,
				inputTrack: track,
				sampleRate,
			});

			if (canCopy) {
				audioTrackOperations.push({type: 'copy'});
			}

			const reencodeOptions = await getAudioTranscodingOptions({
				inputTrack: track,
				outputContainer: container,
				sampleRate,
			});
			audioTrackOperations.push(...reencodeOptions);

			audioTrackOperations.push({
				type: 'drop',
			});
			audioTrackOptions.push({
				trackId: track.id,
				operations: audioTrackOperations,
				audioCodec: track.codec,
			});
		}
	}

	return {videoTrackOptions, audioTrackOptions};
};
