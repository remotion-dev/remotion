import React from 'react';
import {Checkmark} from '../icons/Checkmark';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {Combobox} from './NewComposition/ComboBox';
import {InfoBubble} from './RenderModal/InfoBubble';
import {INFO_TOOLTIP_FONT_SIZE} from './RenderModal/InfoTooltip';
import {label, optionRow, rightRow} from './RenderModal/layout';

const DEFAULT_VALUE = 'studio-default';

const controlWidth: React.CSSProperties = {
	boxSizing: 'border-box',
	width: 180,
};

export const booleanOptions = [
	{label: 'Enabled', value: true},
	{label: 'Disabled', value: false},
] as const;

export const ConfigSelect = <T extends string | boolean>({
	defaultLabel,
	description,
	name,
	onChange,
	options,
	value,
}: {
	readonly defaultLabel: string;
	readonly description: React.ReactNode;
	readonly name: string;
	readonly onChange: (value: T | null) => void;
	readonly options: readonly {label: string; value: T}[];
	readonly value: T | null;
}) => {
	const values: ComboboxValue[] = [
		{
			id: DEFAULT_VALUE,
			keyHint: null,
			label: `Default (${defaultLabel})`,
			leftItem: value === null ? <Checkmark /> : null,
			onClick: () => onChange(null),
			quickSwitcherLabel: null,
			subMenu: null,
			type: 'item',
			value: DEFAULT_VALUE,
		},
		{id: `${DEFAULT_VALUE}-divider`, type: 'divider'},
		...options.map((option): ComboboxValue => {
			const id = `${name}-${String(option.value)}`;
			return {
				id,
				keyHint: null,
				label: option.label,
				leftItem: value === option.value ? <Checkmark /> : null,
				onClick: () => onChange(option.value),
				quickSwitcherLabel: null,
				subMenu: null,
				type: 'item',
				value: id,
			};
		}),
	];

	return (
		<div style={optionRow}>
			<div style={label}>
				{name}
				{description === null ? null : (
					<InfoBubble
						aria-label={`About ${name.toLowerCase()}`}
						horizontalAlignment="right"
					>
						<div
							style={{
								padding: 12,
								maxWidth: 280,
								fontSize: INFO_TOOLTIP_FONT_SIZE,
								lineHeight: 1.5,
							}}
						>
							{description}
						</div>
					</InfoBubble>
				)}
			</div>
			<div style={rightRow}>
				<Combobox
					values={values}
					selectedId={
						value === null ? DEFAULT_VALUE : `${name}-${String(value)}`
					}
					style={controlWidth}
					aria-label={name}
				/>
			</div>
		</div>
	);
};
