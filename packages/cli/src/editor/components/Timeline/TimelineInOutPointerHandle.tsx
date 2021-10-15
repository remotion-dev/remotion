import React, {createRef} from 'react';

const line: React.CSSProperties = {
	height: '100%',
	width: 1,
	position: 'fixed',
	backgroundColor: 'rgba(255, 255, 255, 0.1)',
	cursor: 'ew-resize',
	paddingLeft: 1,
	paddingRight: 1,
};

export const inPointerHandle = createRef<HTMLDivElement>();
export const outPointerHandle = createRef<HTMLDivElement>();

export const TimelineInPointerHandle: React.FC = () => {
	return <div ref={inPointerHandle} style={line} />;
};

export const TimelineOutPointerHandle: React.FC = () => {
	return <div ref={outPointerHandle} style={line} />;
};
