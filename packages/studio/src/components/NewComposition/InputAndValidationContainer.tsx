import type {PropsWithChildren} from 'react';
import React from 'react';

const container: React.CSSProperties = {
	width: 250,
	minWidth: 0,
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'flex-end',
};

export const InputAndValidationContainer: React.FC<PropsWithChildren> = ({
	children,
}) => {
	return <div style={container}>{children}</div>;
};
