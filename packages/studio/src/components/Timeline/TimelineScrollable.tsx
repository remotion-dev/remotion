import React, {useMemo} from 'react';
import {TIMELINE_BACKGROUND} from '../../helpers/colors';
import {HORIZONTAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {scrollableRef} from './timeline-refs';
import {useTimelineMarqueeSelection} from './TimelineSelection';

const outer: React.CSSProperties = {
	width: '100%',
	height: '100%',
	overflowX: 'auto',
	overflowY: 'hidden',
	position: 'relative',
	backgroundColor: TIMELINE_BACKGROUND,
};

const marqueeStyle: React.CSSProperties = {
	backgroundColor: 'rgba(70, 130, 255, 0.16)',
	border: '1px solid rgba(70, 130, 255, 0.75)',
	boxSizing: 'border-box',
	pointerEvents: 'none',
	position: 'fixed',
	zIndex: 10,
};

export const TimelineScrollable: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
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
			style={outer}
			className={HORIZONTAL_SCROLLBAR_CLASSNAME}
			onPointerDownCapture={onPointerDownCapture}
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
