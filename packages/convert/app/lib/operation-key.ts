import type {AudioOperation, VideoOperation} from '@remotion/webcodecs';

export const getVideoOperationId = (operation: VideoOperation) => {
	if (operation.type === 'copy') {
		return 'copy';
	}

	if (operation.type === 'drop') {
		return 'drop';
	}

	if (operation.type === 'reencode') {
		return `reencode-${operation.videoCodec}-${operation.rotate}-${operation.resize}`;
	}

	if (operation.type === 'fail') {
		return 'fail';
	}

	throw new Error(
		'Unknown operation type ' + JSON.stringify(operation satisfies never),
	);
};

export const getAudioOperationId = (operation: AudioOperation) => {
	if (operation.type === 'copy') {
		return 'copy';
	}

	if (operation.type === 'drop') {
		return 'drop';
	}

	if (operation.type === 'reencode') {
		return `reencode-${operation.audioCodec}-${operation.bitrate}`;
	}

	if (operation.type === 'fail') {
		return 'fail';
	}

	throw new Error(
		'Unknown operation type ' + JSON.stringify(operation satisfies never),
	);
};
