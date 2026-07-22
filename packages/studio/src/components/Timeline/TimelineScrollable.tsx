import React, {useMemo} from 'react';
import {
	BORDER_TIMELINE_MARQUEE_BLUE,
	TIMELINE_MARQUEE_BLUE_ALPHA_16,
} from '../../helpers/colors';
import {HORIZONTAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {scrollableRef} from './timeline-refs';
import {
	TIMELINE_BACKGROUND,
	useTimelineMarqueeSelection,
} from './TimelineSelection';
import {useTimelineAssetDrop} from './use-timeline-asset-drop';

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
}> = ({children}) => {
	const {marqueeRect, onPointerDownCapture} = useTimelineMarqueeSelection();
	const {onAssetDragOver, onAssetDrop} = useTimelineAssetDrop();
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
			onPointerDownCapture={onPointerDownCapture}
			onDragOver={onAssetDragOver}
			onDrop={onAssetDrop}
		>
			<div style={containerStyle}>{children}</div>
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
