import React from 'react';
import {FAIL_COLOR, LIGHT_TEXT} from '../helpers/colors';
import type {CaptionData} from './caption-data';
import {CaptionTextEditor} from './CaptionTextEditor';
import {
	InspectorSectionDivider,
	InspectorSectionHeader,
} from './InspectorPanel/common';
import {
	sectionHeaderEnd,
	sectionHeaderRow,
	sectionHeaderTitle,
} from './InspectorPanel/styles';

export type CaptionSaveStatus =
	| {readonly type: 'read-only'}
	| {readonly type: 'saved'}
	| {readonly type: 'saving'}
	| {readonly type: 'error'; readonly message: string};

const status: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 12,
	fontWeight: 'normal',
	lineHeight: '16px',
	marginLeft: 12,
	minWidth: 0,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
};

export const CaptionInspector: React.FC<{
	readonly captions: CaptionData[];
	readonly onTextChange: (captions: CaptionData[]) => void;
	readonly onTextSave: ((captions: CaptionData[]) => void) | null;
	readonly readOnlyTitle: string | null;
	readonly saveStatus: CaptionSaveStatus;
}> = ({captions, onTextChange, onTextSave, readOnlyTitle, saveStatus}) => {
	const statusLabel =
		saveStatus.type === 'saving'
			? 'Saving…'
			: saveStatus.type === 'error'
				? 'Could not save'
				: saveStatus.type === 'read-only'
					? 'Read only'
					: null;
	const statusStyle: React.CSSProperties = {
		...status,
		color: saveStatus.type === 'error' ? FAIL_COLOR : LIGHT_TEXT,
	};

	return (
		<>
			<InspectorSectionDivider />
			<InspectorSectionHeader>
				<div style={sectionHeaderRow}>
					<div style={sectionHeaderTitle}>Captions</div>
					<div style={sectionHeaderEnd}>
						{statusLabel ? (
							<div
								style={statusStyle}
								title={
									saveStatus.type === 'error'
										? saveStatus.message
										: (readOnlyTitle ?? undefined)
								}
							>
								{statusLabel}
							</div>
						) : null}
					</div>
				</div>
			</InspectorSectionHeader>
			<CaptionTextEditor
				captions={captions}
				onChange={onTextChange}
				onSave={onTextSave}
				readOnly={saveStatus.type === 'read-only'}
			/>
		</>
	);
};
