import type {SimpleDiff} from '@remotion/studio-shared';
import React from 'react';
import {
	BLUE,
	FAIL_COLOR,
	LIGHT_TEXT,
	SELECTED_GUIDE,
} from '../../helpers/colors';

export type CodemodStatus =
	| {
			type: 'loading';
	  }
	| {
			type: 'success';
			diff: SimpleDiff;
	  }
	| {
			type: 'fail';
			error: string;
	  };

export const CodemodDiffPreview: React.FC<{
	readonly status: CodemodStatus;
}> = ({status}) => {
	if (status.type === 'loading') {
		return null;
	}

	if (status.type === 'fail') {
		return (
			<span style={{color: FAIL_COLOR, fontSize: 13, lineHeight: 1.2}}>
				{status.error}
			</span>
		);
	}

	return (
		<div style={{lineHeight: 1.2}}>
			<span style={{color: LIGHT_TEXT, fontSize: 13, lineHeight: 1.2}}>
				This will edit your Root file.
			</span>
			<br />
			<span style={{color: BLUE, fontSize: 13, lineHeight: 1.2}}>
				{status.diff.additions} addition
				{status.diff.additions === 1 ? '' : 's'},
			</span>{' '}
			<span
				style={{
					color: SELECTED_GUIDE,
					fontSize: 13,
					lineHeight: 1.2,
				}}
			>
				{status.diff.deletions} deletion
				{status.diff.deletions === 1 ? '' : 's'}
			</span>
		</div>
	);
};
