import React from 'react';

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
	return (
		<div style={{...content, borderTop: '1px solid black'}}>{children}</div>
	);
};
