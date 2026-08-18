import type {LogLevel} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import type {
	ConfigFileStudioSettings,
	ConfigUpdate,
} from '@remotion/studio-shared';
import {DEFAULT_TIMELINE_TRACKS} from '@remotion/studio-shared';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {LIGHT_TEXT} from '../helpers/colors';
import {Checkmark} from '../icons/Checkmark';
import {UndoIcon} from '../icons/undo';
import {Button} from './Button';
import {sectionHeader} from './InspectorPanel/styles';
import {Spacing} from './layout';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {Combobox} from './NewComposition/ComboBox';
import {RemotionInput} from './NewComposition/RemInput';
import {ValidationMessage} from './NewComposition/ValidationMessage';
import {input, label, optionRow, rightRow} from './RenderModal/layout';
import {RenderModalHr} from './RenderModal/RenderModalHr';
import {useSettings} from './SettingsContext';
import {useAutoSaveConfig} from './use-auto-save-config';

const container: React.CSSProperties = {
	display: 'flex',
	flex: 1,
	flexDirection: 'column',
	minWidth: 0,
};

const dividerLabel: React.CSSProperties = {
	...sectionHeader,
	margin: 0,
	padding: '4px 16px',
};

const controlWidth: React.CSSProperties = {
	boxSizing: 'border-box',
	width: 180,
};

const resetIcon: React.CSSProperties = {
	height: 12,
	width: 12,
};

const DEFAULT_VALUE = 'studio-default';

const initialSettings: ConfigFileStudioSettings = {
	askAIEnabled: null,
	audioLatencyHint: null,
	beepOnFinish: null,
	enableCrossSiteIsolation: null,
	interactivityEnabled: null,
	keyboardShortcutsEnabled: null,
	logLevel: null,
	maxTimelineTracks: null,
	numberOfSharedAudioTags: null,
	rspack: null,
};

const ConfigSelect = <T extends string | boolean>({
	defaultLabel,
	name,
	onChange,
	options,
	value,
}: {
	readonly defaultLabel: string;
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
			<div style={label}>{name}</div>
			<div style={rightRow}>
				<Combobox
					values={values}
					selectedId={
						value === null ? DEFAULT_VALUE : `${name}-${String(value)}`
					}
					style={controlWidth}
					title={name}
				/>
			</div>
		</div>
	);
};

const ConfigNumber = ({
	defaultValue,
	name,
	onChange,
	value,
}: {
	readonly defaultValue: number;
	readonly name: string;
	readonly onChange: (value: number | null) => void;
	readonly value: number | null;
}) => {
	return (
		<div style={optionRow}>
			<div style={label}>{name}</div>
			<div style={{...rightRow, gap: 6}}>
				<RemotionInput
					aria-label={name}
					min={0}
					onChange={(event) => {
						if (event.target.value === '') {
							onChange(null);
							return;
						}

						const newValue = Number(event.target.value);
						if (Number.isFinite(newValue) && newValue >= 0) {
							onChange(newValue);
						}
					}}
					placeholder={`Default (${defaultValue})`}
					rightAlign
					status="ok"
					step={1}
					style={{...input, width: 140}}
					type="number"
					value={value ?? ''}
				/>
				<Button
					disabled={value === null}
					onClick={() => onChange(null)}
					size="compact"
					style={{color: LIGHT_TEXT}}
					title={`Use default (${defaultValue})`}
				>
					<UndoIcon style={resetIcon} />
				</Button>
			</div>
		</div>
	);
};

const booleanOptions = [
	{label: 'Enabled', value: true},
	{label: 'Disabled', value: false},
] as const;

export const StudioSettings: React.FC = () => {
	const {error: settingsError, revision, studioRuntimeConfig} = useSettings();
	const [settings, setSettings] =
		useState<ConfigFileStudioSettings>(initialSettings);
	const [editedSetters, setEditedSetters] = useState<Set<string>>(
		() => new Set(),
	);
	const [syncedRevision, setSyncedRevision] = useState(-1);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (studioRuntimeConfig === null) {
			return;
		}

		setSettings(
			studioRuntimeConfig.configFileStudioSettings ?? initialSettings,
		);
		setEditedSetters(new Set());
		setSyncedRevision(revision);
		setError(null);
	}, [revision, studioRuntimeConfig]);

	const changeSetting = useCallback(
		(
			key: keyof ConfigFileStudioSettings,
			setter: string,
			value: ConfigFileStudioSettings[keyof ConfigFileStudioSettings],
		) => {
			setSettings((current) => ({...current, [key]: value}));
			setEditedSetters((current) => new Set(current).add(setter));
		},
		[],
	);

	const updates = useMemo((): ConfigUpdate[] => {
		const update = (
			setter: string,
			value: ConfigFileStudioSettings[keyof ConfigFileStudioSettings],
		): ConfigUpdate =>
			value === null ? {setter, type: 'delete'} : {setter, type: 'set', value};

		const updatesForEditedSetters = [
			update('setAskAIEnabled', settings.askAIEnabled),
			update('setEnableCrossSiteIsolation', settings.enableCrossSiteIsolation),
			update('setBeepOnFinish', settings.beepOnFinish),
			update('setMaxTimelineTracks', settings.maxTimelineTracks),
			update('setAudioLatencyHint', settings.audioLatencyHint),
			update('setNumberOfSharedAudioTags', settings.numberOfSharedAudioTags),
			update('setRspack', settings.rspack),
			update('setKeyboardShortcutsEnabled', settings.keyboardShortcutsEnabled),
			update('setInteractivityEnabled', settings.interactivityEnabled),
			update('setLogLevel', settings.logLevel),
		].filter((item) => editedSetters.has(item.setter));

		if (editedSetters.has('setRspack')) {
			updatesForEditedSetters.push({
				setter: 'setExperimentalRspackEnabled',
				type: 'delete',
			});
		}

		if (editedSetters.has('setLogLevel')) {
			updatesForEditedSetters.push({setter: 'setLevel', type: 'delete'});
		}

		return updatesForEditedSetters;
	}, [editedSetters, settings]);

	const ready = studioRuntimeConfig !== null && syncedRevision === revision;
	useAutoSaveConfig({
		enabled: ready,
		onError: setError,
		ready,
		syncRevision: syncedRevision,
		updates,
	});

	if (studioRuntimeConfig === null) {
		return null;
	}

	return (
		<div style={container}>
			<p style={dividerLabel}>Interface</p>
			<ConfigSelect
				defaultLabel="Enabled"
				name="Ask AI enabled"
				onChange={(value) =>
					changeSetting('askAIEnabled', 'setAskAIEnabled', value)
				}
				options={booleanOptions}
				value={settings.askAIEnabled}
			/>
			<ConfigSelect
				defaultLabel="Enabled"
				name="Keyboard shortcuts enabled"
				onChange={(value) =>
					changeSetting(
						'keyboardShortcutsEnabled',
						'setKeyboardShortcutsEnabled',
						value,
					)
				}
				options={booleanOptions}
				value={settings.keyboardShortcutsEnabled}
			/>
			<ConfigSelect
				defaultLabel="Enabled"
				name="Interactivity enabled"
				onChange={(value) =>
					changeSetting(
						'interactivityEnabled',
						'setInteractivityEnabled',
						value,
					)
				}
				options={booleanOptions}
				value={settings.interactivityEnabled}
			/>
			<ConfigNumber
				defaultValue={DEFAULT_TIMELINE_TRACKS}
				name="Max timeline tracks"
				onChange={(value) =>
					changeSetting('maxTimelineTracks', 'setMaxTimelineTracks', value)
				}
				value={settings.maxTimelineTracks}
			/>

			<RenderModalHr />
			<p style={dividerLabel}>Audio</p>
			<ConfigSelect
				defaultLabel="Playback"
				name="Audio latency hint"
				onChange={(value) =>
					changeSetting('audioLatencyHint', 'setAudioLatencyHint', value)
				}
				options={[
					{label: 'Interactive', value: 'interactive'},
					{label: 'Balanced', value: 'balanced'},
					{label: 'Playback', value: 'playback'},
				]}
				value={settings.audioLatencyHint}
			/>
			<ConfigNumber
				defaultValue={0}
				name="Number of shared audio tags"
				onChange={(value) =>
					changeSetting(
						'numberOfSharedAudioTags',
						'setNumberOfSharedAudioTags',
						value,
					)
				}
				value={settings.numberOfSharedAudioTags}
			/>
			<ConfigSelect
				defaultLabel="Disabled"
				name="Beep on finish"
				onChange={(value) =>
					changeSetting('beepOnFinish', 'setBeepOnFinish', value)
				}
				options={booleanOptions}
				value={settings.beepOnFinish}
			/>

			<RenderModalHr />
			<p style={dividerLabel}>Development</p>
			<ConfigSelect
				defaultLabel="Webpack"
				name="Bundler"
				onChange={(value) => changeSetting('rspack', 'setRspack', value)}
				options={[
					{label: 'Rspack', value: true},
					{label: 'Webpack', value: false},
				]}
				value={settings.rspack}
			/>
			<ConfigSelect
				defaultLabel="Disabled"
				name="Cross-site isolation"
				onChange={(value) =>
					changeSetting(
						'enableCrossSiteIsolation',
						'setEnableCrossSiteIsolation',
						value,
					)
				}
				options={booleanOptions}
				value={settings.enableCrossSiteIsolation}
			/>
			<ConfigSelect<LogLevel>
				defaultLabel="Info"
				name="Log level"
				onChange={(value) => changeSetting('logLevel', 'setLogLevel', value)}
				options={BrowserSafeApis.logLevels.map((value) => ({
					label: value[0].toUpperCase() + value.slice(1),
					value,
				}))}
				value={settings.logLevel}
			/>
			{(error ?? settingsError) ? (
				<>
					<Spacing y={1} block />
					<div style={{paddingLeft: 16, paddingRight: 16}}>
						<ValidationMessage
							align="flex-start"
							message={error ?? settingsError ?? ''}
							type="error"
						/>
					</div>
				</>
			) : null}
			<Spacing y={2} block />
		</div>
	);
};
