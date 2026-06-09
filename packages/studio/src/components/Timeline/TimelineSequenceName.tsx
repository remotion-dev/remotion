import React, {useMemo} from 'react';
import type {TSequence} from 'remotion';
import {
	getTimelineColor,
	getTimelineSelectedLabelStyle,
	TIMELINE_SELECTED_LABEL_BACKGROUND,
} from './TimelineSelection';

const MAX_DISPLAY_NAME_LENGTH = 1000;

const getTruncatedDisplayName = (displayName: string): string => {
	if (displayName.length > MAX_DISPLAY_NAME_LENGTH) {
		return displayName.slice(0, MAX_DISPLAY_NAME_LENGTH) + '...';
	}

	return displayName;
};

export const TimelineSequenceName: React.FC<{
	readonly sequence: TSequence;
	readonly selected: boolean;
	readonly containsSelection: boolean;
}> = ({sequence, selected, containsSelection}) => {
	const style = useMemo((): React.CSSProperties => {
		return {
			alignItems: 'center',
			alignSelf: 'stretch',
			...getTimelineSelectedLabelStyle(selected, false),
			display: 'inline-flex',
			fontSize: 12,
			whiteSpace: 'nowrap',
			textOverflow: 'ellipsis',
			color: getTimelineColor(selected, false),
			userSelect: 'none',
			WebkitUserSelect: 'none',
			textDecoration: 'none',
			boxShadow:
				containsSelection && !selected
					? `inset 0 0 0 2px ${TIMELINE_SELECTED_LABEL_BACKGROUND}`
					: undefined,
		};
	}, [selected, containsSelection]);

	const text = getTruncatedDisplayName(sequence.displayName) || '<Sequence>';

	return (
		<div title={text} style={style}>
			{text}
		</div>
	);
};
