import type {SimpleDiff} from '@remotion/studio-shared';
import React from 'react';
import {BLUE, LIGHT_TEXT, SELECTED_GUIDE} from '../../helpers/colors';

export const CodemodDiffPreview: React.FC<{
	diff: SimpleDiff;
}> = ({diff}) => {
	return (
		<div style={{lineHeight: 1.2}}>
			<span style={{color: LIGHT_TEXT, fontSize: 13, lineHeight: 1.2}}>
				This will edit your Root file.
			</span>
			<br />
			<span style={{color: BLUE, fontSize: 13, lineHeight: 1.2}}>
				{diff.additions} addition
				{diff.additions === 1 ? '' : 's'},
			</span>{' '}
			<span
				style={{
					color: SELECTED_GUIDE,
					fontSize: 13,
					lineHeight: 1.2,
				}}
			>
				{diff.deletions} deletion
				{diff.deletions === 1 ? '' : 's'}
			</span>
		</div>
	);
};
