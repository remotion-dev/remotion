import React, {useCallback, useMemo} from 'react';
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

	const onPointerDownCapture = useCallback(
		(event: React.PointerEvent<HTMLDivElement>) => {
			const {activeElement} = document;
			if (
				event.button === 0 &&
				activeElement instanceof HTMLButtonElement &&
				event.target instanceof Node &&
				!activeElement.contains(event.target)
			) {
				// Timeline drags can prevent the browser's default focus change.
				activeElement.blur();
			}
		},
		[],
	);

	const style = useMemo<React.CSSProperties>(
		() => ({...baseStyle, height: totalSize}),
		[totalSize],
	);

	return (
		<div style={style} onPointerDownCapture={onPointerDownCapture}>
			{children}
		</div>
	);
};

export const TimelineHeightContainer = React.memo(TimelineHeightContainerInner);
