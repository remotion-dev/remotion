import React, {useMemo} from 'react';
import {
	BORDER_TIMELINE_MARQUEE_BLUE,
	TIMELINE_MARQUEE_BLUE_ALPHA_16,
} from '../../helpers/colors';
import {HORIZONTAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {scrollableRef} from './timeline-refs';
import {TimelineAssetDropIndicator} from './TimelineAssetDropIndicator';
import {
	TIMELINE_BACKGROUND,
	useTimelineMarqueeSelection,
} from './TimelineSelection';

const outer: React.CSSProperties = {
	width: '100%',
	height: '100%',
	overflowX: 'auto',
	overflowY: 'hidden',
	position: 'relative',
	backgroundColor: TIMELINE_BACKGROUND,
};

const marqueeStyle: React.CSSProperties = {
	backgroundColor: TIMELINE_MARQUEE_BLUE_ALPHA_16,
	border: BORDER_TIMELINE_MARQUEE_BLUE,
	boxSizing: 'border-box',
	pointerEvents: 'none',
	position: 'fixed',
	zIndex: 10,
};

export const TimelineScrollable: React.FC<{
	readonly children: React.ReactNode;
	readonly marqueeSelectionEnabled?: boolean;
}> = ({children, marqueeSelectionEnabled = true}) => {
	const {marqueeRect, onPointerDownCapture} = useTimelineMarqueeSelection();
	const containerStyle: React.CSSProperties = useMemo(() => {
		return {
			width: '100%',
			minHeight: '100%',
		};
	}, []);

	return (
		<div
			ref={scrollableRef}
			data-timeline-scrollable="true"
			style={outer}
			className={HORIZONTAL_SCROLLBAR_CLASSNAME}
			onPointerDownCapture={
				marqueeSelectionEnabled ? onPointerDownCapture : undefined
			}
		>
			<div style={containerStyle}>{children}</div>
			<TimelineAssetDropIndicator />
			{marqueeRect === null ? null : (
				<div
					style={{
						...marqueeStyle,
						height: marqueeRect.bottom - marqueeRect.top,
						left: marqueeRect.left,
						top: marqueeRect.top,
						width: marqueeRect.right - marqueeRect.left,
					}}
				/>
			)}
		</div>
	);
};
