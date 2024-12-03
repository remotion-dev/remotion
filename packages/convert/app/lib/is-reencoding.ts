import {SupportedConfigs} from '~/components/get-supported-configs';
import {
	getActualAudioConfigIndex,
	getActualVideoConfigIndex,
} from './get-audio-video-config-index';

export const isReencoding = ({
	supportedConfigs,
	videoConfigIndexSelection,
	enableConvert,
}: {
	supportedConfigs: SupportedConfigs;
	videoConfigIndexSelection: Record<number, number>;
	enableConvert: boolean;
}) => {
	return supportedConfigs.videoTrackOptions.every((o) => {
		const index = getActualVideoConfigIndex({
			enableConvert,
			trackNumber: o.trackId,
			videoConfigIndexSelection,
		});
		return o.operations[index].type === 'reencode';
	});
};

export const isDroppingEverything = ({
	supportedConfigs,
	audioConfigIndexSelection,
	videoConfigIndexSelection,
	enableConvert,
}: {
	supportedConfigs: SupportedConfigs;
	audioConfigIndexSelection: Record<number, number>;
	videoConfigIndexSelection: Record<number, number>;
	enableConvert: boolean;
}) => {
	return (
		supportedConfigs.audioTrackOptions.every((o) => {
			const index = getActualAudioConfigIndex({
				audioConfigIndexSelection,
				enableConvert,
				trackNumber: o.trackId,
			});
			return o.operations[index].type === 'drop';
		}) &&
		supportedConfigs.videoTrackOptions.every((o) => {
			const index = getActualVideoConfigIndex({
				enableConvert,
				trackNumber: o.trackId,
				videoConfigIndexSelection,
			});
			return o.operations[index].type === 'drop';
		})
	);
};
