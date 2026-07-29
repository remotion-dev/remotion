import type {InsertElementFileConflict} from '@remotion/studio-shared';
import React, {useCallback} from 'react';
import {useConfirmationDialog} from './ConfirmationDialog';

const filePathStyle: React.CSSProperties = {
	color: 'inherit',
	fontFamily: 'monospace',
	fontSize: 13,
	lineHeight: 1.4,
};

const warningStyle: React.CSSProperties = {
	color: 'inherit',
	fontFamily: 'sans-serif',
	fontSize: 14,
	lineHeight: 1.4,
	marginTop: 12,
};

const sourceDetailsStyle: React.CSSProperties = {
	color: 'inherit',
	fontFamily: 'sans-serif',
	fontSize: 13,
	lineHeight: 1.4,
	marginTop: 12,
};

const sourceSummaryStyle: React.CSSProperties = {
	color: 'inherit',
	cursor: 'pointer',
	fontFamily: 'sans-serif',
	fontSize: 13,
	fontWeight: 500,
	lineHeight: 1.4,
};

const sourceCodeBlockStyle: React.CSSProperties = {
	backgroundColor: 'rgba(255, 255, 255, 0.06)',
	borderRadius: 6,
	color: 'inherit',
	fontFamily: 'monospace',
	fontSize: 12,
	lineHeight: 1.5,
	marginBottom: 0,
	marginTop: 8,
	maxHeight: 200,
	overflow: 'auto',
	padding: 12,
	whiteSpace: 'pre',
};

const sourceCodeStyle: React.CSSProperties = {
	color: 'inherit',
	fontFamily: 'monospace',
	fontSize: 12,
	lineHeight: 1.5,
};

export const useElementOverwriteConfirmation = () => {
	const confirm = useConfirmationDialog();

	return useCallback(
		(conflict: InsertElementFileConflict) => {
			return confirm({
				title: 'Overwrite Element file?',
				message: (
					<>
						The Element file{' '}
						<code style={filePathStyle}>{conflict.filePath}</code> already
						exists with different contents.
						<div style={warningStyle}>
							Overwriting will replace local changes in this file. The
							composition will only be updated if you choose Overwrite.
						</div>
						<details style={sourceDetailsStyle} open>
							<summary style={sourceSummaryStyle}>Existing source</summary>
							<pre style={sourceCodeBlockStyle}>
								<code style={sourceCodeStyle}>{conflict.existingSource}</code>
							</pre>
						</details>
						<details style={sourceDetailsStyle}>
							<summary style={sourceSummaryStyle}>Incoming source</summary>
							<pre style={sourceCodeBlockStyle}>
								<code style={sourceCodeStyle}>{conflict.incomingSource}</code>
							</pre>
						</details>
					</>
				),
				confirmLabel: 'Overwrite',
				cancelLabel: 'Cancel',
			});
		},
		[confirm],
	);
};
