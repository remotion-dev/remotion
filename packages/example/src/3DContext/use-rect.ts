import React from 'react';
import {pathContext} from './path-context-context';

export const useRect = () => {
	const value = React.useContext(pathContext);

	if (!value) {
		throw new Error('useRect must be used within a RectProvider');
	}

	return value;
};
