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
}) => {
	if (!enableConvert) {
		return operations[0];
	}

	return (
		operations.find(
			(o) => getAudioOperationId(o) === audioConfigIndexSelection[trackNumber],
		) ?? operations[0]
	);
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
}) => {
	if (!enableConvert) {
		return operations[0];
	}

	return (
		operations.find(
			(o) => getVideoOperationId(o) === videoConfigIndexSelection[trackNumber],
		) ?? operations[0]
	);
};
