import React from 'react';

const container: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	padding: 12,
	textAlign: 'center',
	width: '100%',
	borderBottom: '1px solid black',
};

export const NewCompHeader: React.FC = () => {
	return <div style={container}>New composition</div>;
};
