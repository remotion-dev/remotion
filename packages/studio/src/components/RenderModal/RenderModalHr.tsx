import React from 'react';

const hrStyle: React.CSSProperties = {
	margin: '0 0 0 0',
	padding: '0 0 0 0',
	border: 'none',
	borderTop: '1px solid #000',
	marginRight: 16,
	marginLeft: 16,
	marginTop: 8,
	marginBottom: 8,
};

export const RenderModalHr: React.FC = () => {
	return <div style={hrStyle} />;
};
