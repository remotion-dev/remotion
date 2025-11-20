// bun run studio
import React from 'react';
import {Composition} from 'remotion';
import {evenHarderCase} from './fixtures';
import {transformOriginFixture} from './transform-origin-fixture';

export const Root: React.FC = () => {
	return (
		<>
			<Composition {...evenHarderCase} />
			<Composition {...transformOriginFixture} />
		</>
	);
};
