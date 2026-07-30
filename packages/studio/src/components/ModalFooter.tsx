import React from 'react';
import {BORDER_BLACK} from '../helpers/colors';

const content: React.CSSProperties = {
	padding: 12,
	paddingRight: 12,
	flex: 1,
	fontSize: 13,
	minWidth: 500,
};

export const ModalFooterContainer: React.FC<{
	readonly children: React.ReactNode;
	readonly style?: React.CSSProperties;
}> = ({children, style}) => {
	return (
		<div style={{...content, ...style, borderTop: BORDER_BLACK}}>
			{children}
		</div>
	);
};
