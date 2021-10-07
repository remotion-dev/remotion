import React from 'react';

const line: React.CSSProperties = {
	height: '100%',
	width: 2,
	position: 'fixed',
	backgroundColor: '#06d639',
};

const dash: React.CSSProperties = {
	width: 10,
	height: 2,
	position: 'fixed',
	backgroundColor: '#06d639',
};

export const TimelineInPointerHandle: React.FC = () => {
	return (
		<>
			<div style={{...dash, top: 0, left: 0}} />
			<div style={line} />
			<div style={{...dash, bottom: 0, left: 0}} />
		</>
	);
};

export const TimelineOutPointerHandle: React.FC = () => {
	return (
		<>
			<div style={{...dash, top: 0, right: 0}} />
			<div style={line} />
			<div style={{...dash, bottom: 0, right: 0}} />
		</>
	);
};
