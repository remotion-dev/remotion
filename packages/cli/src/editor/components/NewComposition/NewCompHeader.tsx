import React from 'react';
import {CancelButton} from './CancelButton';

const container: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	padding: 12,
	textAlign: 'center',
	width: '100%',
	borderBottom: '1px solid black',
};

export const NewCompHeader: React.FC = () => {
	return (
		<div style={container}>
			<div>New composition</div>
			<div style={{flex: 1}} />
			<CancelButton style={{height: 20, width: 20}} />
		</div>
	);
};
