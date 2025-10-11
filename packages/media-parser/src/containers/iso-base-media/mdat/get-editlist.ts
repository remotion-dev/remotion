import type {TrakBox} from '../trak/trak';
import {getElstBox} from '../traversal';

export const findTrackStartTimeInSeconds = ({
	movieTimeScale,
	trakBox,
}: {
	movieTimeScale: number;
	trakBox: TrakBox;
}) => {
	const elstBox = getElstBox(trakBox);

	if (!elstBox) {
		return 0;
	}

	const {entries} = elstBox;

	let dwellTime = 0;

	for (const entry of entries) {
		const {editDuration, mediaTime} = entry;
		if (mediaTime !== -1) {
			continue;
		}

		dwellTime += editDuration;
	}

	return dwellTime / movieTimeScale;
};

export const findTrackMediaTimeOffsetInTrackTimescale = ({
	trakBox,
}: {
	trakBox: TrakBox;
}) => {
	const elstBox = getElstBox(trakBox);

	if (!elstBox) {
		return 0;
	}

	const {entries} = elstBox;

	let dwellTime = 0;

	for (const entry of entries) {
		const {mediaTime} = entry;
		if (mediaTime === -1) {
			continue;
		}

		dwellTime += mediaTime;
	}

	return dwellTime;
};
