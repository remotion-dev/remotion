import React from 'react';
import {Composition, Folder} from 'remotion';
import {issue7359FitTextOnNLines} from './fixtures/issue-7359-fit-text-on-n-lines';
import {longUnbreakableTokenFitText} from './fixtures/long-unbreakable-token-fit-text';

export const Root: React.FC = () => {
	return (
		<Folder name="layout-utils">
			<Composition {...issue7359FitTextOnNLines} />
			<Composition {...longUnbreakableTokenFitText} />
		</Folder>
	);
};
