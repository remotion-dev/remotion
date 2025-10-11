import type {AudioOperation, VideoOperation} from '@remotion/webcodecs';
import {getAudioOperationId, getVideoOperationId} from './operation-key';

export const getActualAudioConfigIndex = ({
	audioConfigIndexSelection,
	enableConvert,
	trackNumber,
	operations,
}: {
	audioConfigIndexSelection: Record<number, string>;
	enableConvert: boolean;
	trackNumber: number;
	operations: AudioOperation[];
}): AudioOperation => {
	if (!enableConvert) {
		return operations[0];
	}

	const operation = operations.find(
		(o) => getAudioOperationId(o) === audioConfigIndexSelection[trackNumber],
	);

	if (operation) {
		return operation;
	}

	if (new URLSearchParams(window.location.search).get('audio') === 'drop') {
		return {
			type: 'drop',
		};
	}

	return operations[0];
};

export const getActualVideoOperation = ({
	videoConfigIndexSelection,
	enableConvert,
	trackNumber,
	operations,
}: {
	videoConfigIndexSelection: Record<number, string>;
	enableConvert: boolean;
	trackNumber: number;
	operations: VideoOperation[];
}): VideoOperation => {
	if (!enableConvert) {
		return operations[0];
	}

	const operation = operations.find(
		(o) => getVideoOperationId(o) === videoConfigIndexSelection[trackNumber],
	);
	if (operation) {
		return operation;
	}

	if (new URLSearchParams(window.location.search).get('video') === 'drop') {
		return {
			type: 'drop',
		};
	}

	return operations[0];
};
