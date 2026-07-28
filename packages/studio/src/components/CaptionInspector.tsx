import type {Caption} from '@remotion/captions';
import React from 'react';
import {LIGHT_TEXT} from '../helpers/colors';
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

const readOnlyStatus: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 12,
	fontWeight: 'normal',
	lineHeight: '16px',
	marginLeft: 12,
};

export const CaptionInspector: React.FC<{
	readonly captions: Caption[];
	readonly onTextChange: (captions: Caption[]) => void;
	readonly onTextSave: ((captions: Caption[]) => void) | null;
	readonly onTextCancel: (() => void) | null;
	readonly readOnly: boolean;
	readonly readOnlyTitle: string | null;
}> = ({
	captions,
	onTextChange,
	onTextSave,
	onTextCancel,
	readOnly,
	readOnlyTitle,
}) => {
	return (
		<>
			<InspectorSectionDivider />
			<InspectorSectionHeader>
				<div style={sectionHeaderRow}>
					<div style={sectionHeaderTitle}>Captions</div>
					<div style={sectionHeaderEnd}>
						{readOnly ? (
							<div style={readOnlyStatus} title={readOnlyTitle ?? undefined}>
								Read only
							</div>
						) : null}
					</div>
				</div>
			</InspectorSectionHeader>
			<CaptionTextEditor
				captions={captions}
				onChange={onTextChange}
				onSave={onTextSave}
				onCancel={onTextCancel}
				readOnly={readOnly}
			/>
		</>
	);
};
