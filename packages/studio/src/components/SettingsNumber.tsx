import React from 'react';
import {InputDragger} from './NewComposition/InputDragger';
import type {SettingId} from './settings-catalog';
import {settingsCatalog} from './settings-catalog';
import {SettingsRow} from './SettingsRow';

export const SettingsNumber: React.FC<{
	readonly settingId: SettingId;
	readonly value: number;
	readonly onValueChanged: React.Dispatch<React.SetStateAction<number>>;
	readonly min: number;
	readonly max: number | null;
	readonly step: number;
}> = ({settingId, value, onValueChanged, min, max, step}) => {
	return (
		<SettingsRow settingId={settingId}>
			<InputDragger
				aria-label={`${settingsCatalog[settingId].name}: ${value}`}
				value={value}
				min={min}
				max={max ?? undefined}
				step={step}
				status="ok"
				rightAlign
				placeholder=""
				buttonStyle={{width: 180, textAlign: 'right'}}
				onValueChangeCancel={null}
				onValueChange={onValueChanged}
				onTextChange={(text) => {
					const parsed = step < 1 ? parseFloat(text) : parseInt(text, 10);
					if (!Number.isNaN(parsed)) {
						onValueChanged(Math.min(max ?? Infinity, Math.max(min, parsed)));
					}
				}}
			/>
		</SettingsRow>
	);
};
