import React from 'react';
import {LIGHT_TEXT} from '../helpers/colors';
import {Checkmark} from '../icons/Checkmark';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {Combobox} from './NewComposition/ComboBox';
import type {SettingId} from './settings-catalog';
import {settingsCatalog} from './settings-catalog';
import {SettingsRow} from './SettingsRow';

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
	cliFlag,
	defaultLabel,
	settingId,
	onChange,
	options,
	value,
}: {
	readonly cliFlag: string | null;
	readonly defaultLabel: string;
	readonly settingId: SettingId;
	readonly onChange: (value: T | null) => void;
	readonly options: readonly {label: string; value: T}[];
	readonly value: T | null;
}) => {
	const {name} = settingsCatalog[settingId];
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
		<SettingsRow settingId={settingId}>
			{cliFlag === null ? (
				<Combobox
					values={values}
					selectedId={
						value === null ? DEFAULT_VALUE : `${name}-${String(value)}`
					}
					style={controlWidth}
					aria-label={name}
				/>
			) : (
				<span style={{color: LIGHT_TEXT, fontSize: 12}}>
					{options.find((option) => option.value === value)?.label} (set by --
					{cliFlag})
				</span>
			)}
		</SettingsRow>
	);
};
