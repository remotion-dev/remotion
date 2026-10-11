import {useState} from 'react';

export const useTimelineDetailVisibility = (
	width: number,
	minimumWidth: number,
) => {
	const [visible, setVisible] = useState(() => width >= minimumWidth);
	// Keep details mounted through small zoom reversals near the threshold.
	const threshold = visible
		? minimumWidth - Math.min(8, minimumWidth / 4)
		: minimumWidth;
	const nextVisible = width >= threshold;
	if (nextVisible !== visible) {
		// Derive during rendering so geometry and detail change in the same commit.
		setVisible(nextVisible);
	}

	return nextVisible;
};
