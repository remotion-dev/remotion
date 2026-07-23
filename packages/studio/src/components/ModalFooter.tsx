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
}> = ({children}) => {
	return <div style={{...content, borderTop: BORDER_BLACK}}>{children}</div>;
};
