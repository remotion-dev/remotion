import {DEFAULT_MEMORY_SIZE} from '@remotion/lambda-client/constants';
import React from 'react';

export const DefaultMemorySize: React.FC = () => {
	return <span>{DEFAULT_MEMORY_SIZE}</span>;
};
