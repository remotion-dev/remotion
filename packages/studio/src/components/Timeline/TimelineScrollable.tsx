import React, {useCallback, useMemo} from 'react';
import {TIMELINE_BACKGROUND} from '../../helpers/colors';
import {HORIZONTAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {scrollableRef} from './timeline-refs';
import {useTimelineSelection} from './TimelineSelection';

const outer: React.CSSProperties = {
	width: '100%',
	height: '100%',
	overflowX: 'auto',
	overflowY: 'hidden',
	position: 'relative',
	backgroundColor: TIMELINE_BACKGROUND,
};

export const TimelineScrollable: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const {clearSelection} = useTimelineSelection();

	// Selection-triggering click handlers in children call e.stopPropagation(),
	// so any pointerdown that bubbles up here is by definition on empty space
	// and should clear the current selection.
	const onPointerDown = useCallback(
		(e: React.PointerEvent<HTMLDivElement>) => {
			if (e.button !== 0) {
				return;
			}

			clearSelection();
		},
		[clearSelection],
	);

	const containerStyle: React.CSSProperties = useMemo(() => {
		return {
			width: '100%',
			minHeight: '100%',
		};
	}, []);

	return (
		<div
			ref={scrollableRef}
			style={outer}
			className={HORIZONTAL_SCROLLBAR_CLASSNAME}
		>
			<div style={containerStyle} onPointerDown={onPointerDown}>
				{children}
			</div>
		</div>
	);
};
