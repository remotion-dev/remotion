import type {SupportedConfigs} from '~/components/get-supported-configs';
import {
	getActualAudioConfigIndex,
	getActualVideoOperation,
} from './get-audio-video-config-index';

export const isReencoding = ({
	supportedConfigs,
	videoConfigIndexSelection,
	enableConvert,
}: {
	supportedConfigs: SupportedConfigs;
	videoConfigIndexSelection: Record<number, string>;
	enableConvert: boolean;
}) => {
	return supportedConfigs.videoTrackOptions.every((o) => {
		const operation = getActualVideoOperation({
			enableConvert,
			trackNumber: o.trackId,
			videoConfigIndexSelection,
			operations: o.operations,
		});
		return operation.type === 'reencode';
	});
};

export const isDroppingEverything = ({
	supportedConfigs,
	audioConfigIndexSelection,
	videoConfigIndexSelection,
	enableConvert,
}: {
	supportedConfigs: SupportedConfigs;
	audioConfigIndexSelection: Record<number, string>;
	videoConfigIndexSelection: Record<number, string>;
	enableConvert: boolean;
}) => {
	return (
		supportedConfigs.audioTrackOptions.every((o) => {
			const operation = getActualAudioConfigIndex({
				audioConfigIndexSelection,
				enableConvert,
				trackNumber: o.trackId,
				operations: o.operations,
			});
			return operation.type === 'drop';
		}) &&
		supportedConfigs.videoTrackOptions.every((o) => {
			const operation = getActualVideoOperation({
				enableConvert,
				trackNumber: o.trackId,
				videoConfigIndexSelection,
				operations: o.operations,
			});
			return operation.type === 'drop';
		})
	);
};
