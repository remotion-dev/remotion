export const getActualAudioConfigIndex = ({
	audioConfigIndexSelection,
	enableConvert,
	trackNumber,
}: {
	audioConfigIndexSelection: Record<number, number>;
	enableConvert: boolean;
	trackNumber: number;
}) => {
	if (!enableConvert) {
		return 0;
	}

	return audioConfigIndexSelection[trackNumber] ?? 0;
};

export const getActualVideoConfigIndex = ({
	videoConfigIndexSelection,
	enableConvert,
	trackNumber,
}: {
	videoConfigIndexSelection: Record<number, number>;
	enableConvert: boolean;
	trackNumber: number;
}) => {
	if (!enableConvert) {
		return 0;
	}

	return videoConfigIndexSelection[trackNumber] ?? 0;
};
