// bun run studio
import React from 'react';
import {Composition} from 'remotion';
import {evenHarderCase} from './fixtures';

export const Root: React.FC = () => {
	return <Composition {...evenHarderCase} />;
};
