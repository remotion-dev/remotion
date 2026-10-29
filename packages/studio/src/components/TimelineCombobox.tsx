import React from 'react';
import {LIGHT_TEXT} from '../helpers/colors';
import {CaretDown} from '../icons/caret';
import {ActionTooltip} from './ActionTooltip';
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
	fontVariantNumeric: 'tabular-nums',
	lineHeight: '16px',
	overflow: 'hidden',
	textAlign: 'left',
	textOverflow: 'ellipsis',
	userSelect: 'none',
	WebkitUserSelect: 'none',
	whiteSpace: 'nowrap',
};

type SelectionItem = Extract<ComboboxValue, {type: 'item'}>;

export const TimelineCombobox: React.FC<{
	readonly values: ComboboxValue[];
	readonly selectedId: string | number;
	readonly selectedLabel: string | null;
	readonly 'aria-label': string;
	readonly tooltipDelay: number | null;
	readonly labelWidth?: number;
	readonly renderLeftItem?: RenderInlineAction;
	readonly unhoveredIconColor?: string;
}> = ({
	values,
	selectedId,
	selectedLabel,
	'aria-label': ariaLabel,
	tooltipDelay,
	labelWidth = 32,
	renderLeftItem,
	unhoveredIconColor = LIGHT_TEXT,
}) => {
	const selected = values.find((value) => value.id === selectedId) as
		| SelectionItem
		| undefined;
	const displayLabel = selectedLabel ?? selected?.label;
	const segments: SegmentedButtonSegment[] = [
		{
			ariaLabel,
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
					{selected || displayLabel ? (
						<div
							role="group"
							aria-label={
								tooltipDelay === null && typeof displayLabel === 'string'
									? displayLabel
									: undefined
							}
							style={{...label, minWidth: labelWidth}}
						>
							{displayLabel}
						</div>
					) : null}
					<Spacing x={0.5} />
					<CaretDown color={color} />
				</>
			),
			segmentId: 'selector',
			selectedId,
			style: {fontFamily: 'inherit', padding: '0 4px'},
			tooltipLabel: null,
			type: 'menu',
			values,
		},
	];

	const button = (
		<SegmentedButton segments={segments} style={segmentedButtonStyle} />
	);

	return tooltipDelay === null ? (
		button
	) : (
		<ActionTooltip
			label={ariaLabel}
			shortcut={null}
			delay={tooltipDelay}
			dismissOnClick
		>
			{button}
		</ActionTooltip>
	);
};
