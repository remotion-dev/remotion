import React, {useMemo} from 'react';
import {TIMELINE_BACKGROUND} from './TimelineSelection';
import {useTimelineVirtualization} from './TimelineVirtualization';

const baseStyle: React.CSSProperties = {
	display: 'flex',
	flex: 1,
	minHeight: '100%',
	overflowX: 'hidden',
	backgroundColor: TIMELINE_BACKGROUND,
};

const TimelineHeightContainerInner: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const {totalSize} = useTimelineVirtualization();

	const style = useMemo<React.CSSProperties>(
		() => ({...baseStyle, height: totalSize}),
		[totalSize],
	);

	return <div style={style}>{children}</div>;
};

export const TimelineHeightContainer = React.memo(TimelineHeightContainerInner);
