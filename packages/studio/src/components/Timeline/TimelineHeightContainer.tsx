import React, {useMemo} from 'react';
import type {TrackWithHash} from '../../helpers/get-timeline-sequence-sort-key';
import {TIMELINE_BACKGROUND} from './TimelineSelection';
import {useTimelineHeight} from './use-timeline-height';

const baseStyle: React.CSSProperties = {
	display: 'flex',
	flex: 1,
	minHeight: '100%',
	overflowX: 'hidden',
	backgroundColor: TIMELINE_BACKGROUND,
};

const TimelineHeightContainerInner: React.FC<{
	readonly shown: TrackWithHash[];
	readonly hasBeenCut: boolean;
	readonly children: React.ReactNode;
}> = ({shown, hasBeenCut, children}) => {
	const height = useTimelineHeight({shown, hasBeenCut});

	const style = useMemo<React.CSSProperties>(
		() => ({...baseStyle, height}),
		[height],
	);

	return <div style={style}>{children}</div>;
};

export const TimelineHeightContainer = React.memo(TimelineHeightContainerInner);
