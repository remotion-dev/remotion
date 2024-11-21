import {SupportedConfigs} from '~/components/get-supported-configs';

export const isReencoding = ({
	supportedConfigs,
	videoConfigIndex,
}: {
	supportedConfigs: SupportedConfigs;
	videoConfigIndex: Record<number, number>;
}) => {
	return supportedConfigs.videoTrackOptions.every(
		(o) => o.operations[videoConfigIndex[o.trackId] ?? 0].type === 'reencode',
	);
};

export const isDroppingEverything = ({
	supportedConfigs,
	audioConfigIndex,
	videoConfigIndex,
}: {
	supportedConfigs: SupportedConfigs;
	audioConfigIndex: Record<number, number>;
	videoConfigIndex: Record<number, number>;
}) => {
	return (
		supportedConfigs.audioTrackOptions.every(
			(o) => o.operations[audioConfigIndex[o.trackId] ?? 0].type === 'drop',
		) &&
		supportedConfigs.videoTrackOptions.every(
			(o) => o.operations[videoConfigIndex[o.trackId] ?? 0].type === 'drop',
		)
	);
};
