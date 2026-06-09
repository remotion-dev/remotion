import React, {useMemo} from 'react';
import {HORIZONTAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {scrollableRef} from './timeline-refs';
import {TIMELINE_BACKGROUND} from './TimelineSelection';

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
			<div style={containerStyle}>{children}</div>
		</div>
	);
};
