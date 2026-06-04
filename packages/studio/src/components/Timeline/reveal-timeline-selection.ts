import type {SequenceNodePathInfo} from '../../helpers/get-timeline-sequence-sort-key';
import {getTimelineSequenceSelectionKey} from './TimelineSelection';

const timelineSequenceRows = new Map<string, HTMLElement>();

export const getTimelineRevealAncestorNodePathInfos = (
	nodePathInfo: SequenceNodePathInfo,
): SequenceNodePathInfo[] => {
	return nodePathInfo.auxiliaryKeys.map((_, i) => ({
		...nodePathInfo,
		auxiliaryKeys: nodePathInfo.auxiliaryKeys.slice(0, i),
	}));
};

export const registerTimelineSequenceRow = ({
	element,
	nodePathInfo,
}: {
	readonly element: HTMLElement | null;
	readonly nodePathInfo: SequenceNodePathInfo;
}) => {
	const key = getTimelineSequenceSelectionKey(nodePathInfo);
	if (element === null) {
		timelineSequenceRows.delete(key);
		return;
	}

	timelineSequenceRows.set(key, element);
};

export const scrollTimelineSequenceIntoView = (
	nodePathInfo: SequenceNodePathInfo,
) => {
	const row = timelineSequenceRows.get(
		getTimelineSequenceSelectionKey(nodePathInfo),
	);
	row?.scrollIntoView({
		block: 'nearest',
		inline: 'nearest',
	});
};
