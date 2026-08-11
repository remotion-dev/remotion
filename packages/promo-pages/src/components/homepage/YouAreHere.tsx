import React from 'react';

const container: React.CSSProperties = {
	width: '100%',
	display: 'inline-flex',
	justifyContent: 'center',
	position: 'relative',
};

const label: React.CSSProperties = {
	backgroundColor: 'var(--ifm-color-primary)',
	fontWeight: 'bold',
	color: 'white',
	paddingLeft: 8,
	paddingRight: 8,
	paddingTop: 4,
	paddingBottom: 4,
	borderRadius: 6,
	fontSize: 13,
	position: 'absolute',
	marginTop: -25,
};

export const YouAreHere: React.FC = () => {
	return (
		<div style={container}>
			<div style={label}>YOU ARE HERE</div>
		</div>
	);
};
