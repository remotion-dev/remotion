import React, {useContext} from 'react';
import type {SchemaFieldInfo} from '../../helpers/timeline-layout';
import {
	timelineFieldValueColumnStyle,
	timelineStackedFieldContentStyle,
} from './timeline-field-row-layout';
import {AssetSelectionContext} from './TimelineAssetField';
import {TimelineFieldLabel} from './TimelineFieldLabel';

const assetSourceRowStyle: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	flex: 1,
	minWidth: 0,
};

export const TimelineFieldRowContent: React.FC<{
	readonly field: SchemaFieldInfo;
	readonly rowDepth: number;
	readonly selected: boolean;
	readonly children: React.ReactNode;
}> = ({field, rowDepth, selected, children}) => {
	const {sourceDisplay} = useContext(AssetSelectionContext);
	if (
		field.typeName === 'asset' &&
		field.key === 'src' &&
		sourceDisplay !== null
	) {
		return <div style={assetSourceRowStyle}>{children}</div>;
	}

	const label = (
		<TimelineFieldLabel
			rowDepth={rowDepth}
			selected={selected}
			label={field.description ?? field.key}
			stacked={field.typeName === 'text-content'}
		/>
	);
	const value = <div style={timelineFieldValueColumnStyle}>{children}</div>;

	if (field.typeName === 'text-content') {
		return (
			<div style={timelineStackedFieldContentStyle}>
				{label}
				{value}
			</div>
		);
	}

	return (
		<>
			{label}
			{value}
		</>
	);
};
