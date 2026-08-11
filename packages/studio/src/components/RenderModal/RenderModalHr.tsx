import React from 'react';
import {BORDER_BLACK} from '../../helpers/colors';

const hrStyle: React.CSSProperties = {
	margin: '0 0 0 0',
	padding: '0 0 0 0',
	border: 'none',
	borderTop: BORDER_BLACK,
	marginRight: 16,
	marginLeft: 16,
	marginTop: 8,
	marginBottom: 8,
};

export const RenderModalHr: React.FC = () => {
	return <div style={hrStyle} />;
};
