import React from 'react';
import {LIGHT_TEXT} from '../helpers/colors';
import {CaretDown} from '../icons/caret';
import type {RenderInlineAction} from './InlineAction';
import {Spacing} from './layout';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {SegmentedButton, type SegmentedButtonSegment} from './SegmentedButton';

const segmentedButtonStyle: React.CSSProperties = {
	height: 28,
};

const label: React.CSSProperties = {
	flex: 'none',
	fontFamily: 'inherit',
	fontSize: 12,
	lineHeight: '16px',
	minWidth: 0,
	overflow: 'hidden',
	textAlign: 'left',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
};

type SelectionItem = Extract<ComboboxValue, {type: 'item'}>;

export const TimelineCombobox: React.FC<{
	readonly values: ComboboxValue[];
	readonly selectedId: string | number;
	readonly title: string;
	readonly labelWidth?: number;
	readonly renderLeftItem?: RenderInlineAction;
	readonly unhoveredIconColor?: string;
}> = ({
	values,
	selectedId,
	title,
	labelWidth = 32,
	renderLeftItem,
	unhoveredIconColor = LIGHT_TEXT,
}) => {
	const selected = values.find((value) => value.id === selectedId) as
		| SelectionItem
		| undefined;
	const segments: SegmentedButtonSegment[] = [
		{
			ariaLabel: title,
			buttonId: null,
			disabled: false,
			idleColor: unhoveredIconColor,
			leaveLeftSpace: true,
			onOpenChange: null,
			renderContent: (color) => (
				<>
					{renderLeftItem ? (
						<>
							{renderLeftItem(color)}
							<Spacing x={0.5} />
						</>
					) : null}
					{selected ? (
						<div
							title={
								typeof selected.label === 'string' ? selected.label : undefined
							}
							style={{...label, width: labelWidth}}
						>
							{selected.label}
						</div>
					) : null}
					<Spacing x={0.5} />
					<CaretDown color={color} />
				</>
			),
			segmentId: 'selector',
			selectedId,
			style: {fontFamily: 'inherit', padding: '0 4px'},
			title,
			type: 'menu',
			values,
		},
	];

	return (
		<SegmentedButton
			segments={segments}
			style={segmentedButtonStyle}
			title={null}
		/>
	);
};
