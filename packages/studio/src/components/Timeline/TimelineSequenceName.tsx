import React, {useCallback, useMemo, useState} from 'react';
import type {TSequence} from 'remotion';
import {
	getTimelineColor,
	getTimelineSelectedLabelStyle,
	SELECTION_ENABLED,
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
	const [hovered, setHovered] = useState(false);
	const {documentationLink} = sequence;
	const hoverable = !SELECTION_ENABLED && documentationLink !== null;

	const onClick = useCallback(() => {
		if (documentationLink === null) {
			return;
		}

		window.open(documentationLink, '_blank', 'noopener,noreferrer');
	}, [documentationLink]);

	const onPointerEnter = useCallback(() => setHovered(true), []);
	const onPointerLeave = useCallback(() => setHovered(false), []);

	const style = useMemo((): React.CSSProperties => {
		const hoverEffect = hovered && hoverable;
		return {
			alignItems: 'center',
			alignSelf: 'stretch',
			...getTimelineSelectedLabelStyle(selected, false),
			display: 'inline-flex',
			fontSize: 12,
			whiteSpace: 'nowrap',
			textOverflow: 'ellipsis',
			overflow: 'hidden',
			color: getTimelineColor(selected, false),
			userSelect: 'none',
			WebkitUserSelect: 'none',
			textDecoration: hoverEffect ? 'underline' : 'none',
			cursor: hoverEffect ? 'pointer' : undefined,
			boxShadow:
				containsSelection && !selected
					? `inset 0 0 0 2px ${TIMELINE_SELECTED_LABEL_BACKGROUND}`
					: undefined,
		};
	}, [hovered, hoverable, selected, containsSelection]);

	const text = getTruncatedDisplayName(sequence.displayName) || '<Sequence>';

	return (
		<div
			onPointerEnter={hoverable ? onPointerEnter : undefined}
			onPointerLeave={hoverable ? onPointerLeave : undefined}
			title={
				documentationLink ? `Open documentation: ${documentationLink}` : text
			}
			style={style}
			onClick={hoverable ? onClick : undefined}
		>
			{text}
		</div>
	);
};
