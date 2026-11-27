import type {LogLevel} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import type {
	ConfigFileStudioSettings,
	ConfigUpdate,
} from '@remotion/studio-shared';
import React, {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useState,
} from 'react';
import {Internals} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {LIGHT_TEXT} from '../helpers/colors';
import {applyStudioHighContrast} from '../helpers/studio-css-variables';
import {UndoIcon} from '../icons/undo';
import {Button} from './Button';
import {Checkbox} from './Checkbox';
import {ConfigSelect} from './ConfigSelect';
import {sectionHeader} from './InspectorPanel/styles';
import {Spacing} from './layout';
import {
	InputDragger,
	parseInputDraggerNumber,
} from './NewComposition/InputDragger';
import {RemotionInput} from './NewComposition/RemInput';
import {ValidationMessage} from './NewComposition/ValidationMessage';
import {rightRow} from './RenderModal/layout';
import type {SettingId} from './settings-catalog';
import {settingsCatalog} from './settings-catalog';
import {useSettings} from './SettingsContext';
import {SettingsRow} from './SettingsRow';
import {useAutoSaveConfig} from './use-auto-save-config';

const container: React.CSSProperties = {
	alignSelf: 'flex-start',
	border: 0,
	display: 'flex',
	flex: 1,
	flexDirection: 'column',
	margin: 0,
	minWidth: 0,
	padding: 0,
};

const disabledContainer: React.CSSProperties = {
	...container,
	opacity: 0.6,
	pointerEvents: 'none',
};

const dividerLabel: React.CSSProperties = {
	...sectionHeader,
	lineHeight: '16px',
	margin: 0,
	padding: '4px 16px 0',
};

const sectionTitle: React.CSSProperties = {
	...dividerLabel,
	marginTop: 8,
};

const resetIcon: React.CSSProperties = {
	height: 12,
	width: 12,
};

const initialSettings: ConfigFileStudioSettings = {
	doubleClickAction: null,
	highContrast: null,
	preservePitchOnPlayback: null,
	showLayerFrameNumbers: null,
	showPremounting: null,
	defaultPremountInSeconds: null,
	askAIEnabled: null,
	audioLatencyHint: null,
	beepOnFinish: null,
	enableCrossSiteIsolation: null,
	sequenceActivityLimit: null,
	interactivityEnabled: null,
	keyboardShortcutsEnabled: null,
	logLevel: null,
	maxTimelineTracks: null,
	numberOfSharedAudioTags: null,
	rspack: null,
	canvasTabsEnabled: null,
	showDiagnostics: null,
};

const ConfigNumber = ({
	defaultValue,
	settingId,
	onChange,
	onChangeEnd,
	value,
	step,
	suffix,
}: {
	readonly defaultValue: number;
	readonly step: number;
	readonly suffix: string | null;
	readonly settingId: SettingId;
	readonly onChange: (value: number | null) => void;
	readonly onChangeEnd: (value: number | null) => void;
	readonly value: number | null;
}) => {
	const {name} = settingsCatalog[settingId];
	const valueSuffix = suffix === null ? '' : ` ${suffix}`;
	const defaultLabel = `Default (${defaultValue}${valueSuffix})`;

	return (
		<SettingsRow settingId={settingId}>
			<div style={{...rightRow, gap: 6}}>
				<InputDragger
					onValueChangeCancel={() => onChange(value)}
					aria-label={name}
					buttonStyle={{textAlign: 'right', width: 140}}
					formatter={() =>
						value === null ? defaultLabel : `${value}${valueSuffix}`
					}
					min={0}
					onTextChange={() => undefined}
					onValueChange={onChange}
					onValueChangeEnd={onChangeEnd}
					placeholder={defaultLabel}
					rightAlign
					status="ok"
					step={step}
					value={value ?? defaultValue}
				/>
				<Button
					disabled={value === null}
					onClick={() => onChangeEnd(null)}
					size="compact"
					style={{color: LIGHT_TEXT}}
					aria-label={`Use default (${defaultValue}${valueSuffix})`}
				>
					<UndoIcon style={resetIcon} />
				</Button>
			</div>
		</SettingsRow>
	);
};

export const StudioSettings: React.FC = () => {
	const {
		error: settingsError,
		revision,
		studioRuntimeConfig,
		showDiagnostics,
		setShowDiagnostics,
	} = useSettings();
	const [settings, setSettings] =
		useState<ConfigFileStudioSettings>(initialSettings);
	const [sequenceActivityLimitText, setSequenceActivityLimitText] =
		useState('Infinity');
	const [committedNumberSettings, setCommittedNumberSettings] = useState<{
		numberOfSharedAudioTags: number | null;
		defaultPremountInSeconds: number | null;
		sequenceActivityLimit: number | null;
	}>({
		numberOfSharedAudioTags: null,
		defaultPremountInSeconds: null,
		sequenceActivityLimit: null,
	});
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
		setSequenceActivityLimitText(
			String(
				studioRuntimeConfig.configFileStudioSettings?.sequenceActivityLimit ??
					Internals.DEFAULT_SEQUENCE_ACTIVITY_LIMIT,
			),
		);
		setCommittedNumberSettings({
			sequenceActivityLimit:
				studioRuntimeConfig.configFileStudioSettings?.sequenceActivityLimit ??
				null,
			defaultPremountInSeconds:
				studioRuntimeConfig.configFileStudioSettings
					?.defaultPremountInSeconds ?? null,
			numberOfSharedAudioTags:
				studioRuntimeConfig.configFileStudioSettings?.numberOfSharedAudioTags ??
				null,
		});
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
	const previewNumberSetting = useCallback(
		(
			key:
				| 'numberOfSharedAudioTags'
				| 'defaultPremountInSeconds'
				| 'sequenceActivityLimit',
			value: number | null,
		) => {
			setSettings((current) => ({...current, [key]: value}));
		},
		[],
	);
	const commitNumberSetting = useCallback(
		(
			key:
				| 'numberOfSharedAudioTags'
				| 'defaultPremountInSeconds'
				| 'sequenceActivityLimit',
			setter: string,
			value: number | null,
		) => {
			setSettings((current) => ({...current, [key]: value}));
			setCommittedNumberSettings((current) => ({...current, [key]: value}));
			setEditedSetters((current) => new Set(current).add(setter));
		},
		[],
	);

	const updates = useMemo((): ConfigUpdate[] => {
		const update = (
			setter: string,
			value: ConfigFileStudioSettings[keyof ConfigFileStudioSettings],
		): ConfigUpdate =>
			value === null || value === undefined
				? {setter, type: 'delete'}
				: {setter, type: 'set', value};

		const updatesForEditedSetters = [
			update('setHighContrast', settings.highContrast),
			update('setPreservePitchOnPlayback', settings.preservePitchOnPlayback),
			update('setShowLayerFrameNumbers', settings.showLayerFrameNumbers),
			update('setShowPremounting', settings.showPremounting),
			update('setEnableCrossSiteIsolation', settings.enableCrossSiteIsolation),
			update('setAudioLatencyHint', settings.audioLatencyHint),
			update(
				'setNumberOfSharedAudioTags',
				committedNumberSettings.numberOfSharedAudioTags,
			),
			update(
				'setDefaultPremountInSeconds',
				committedNumberSettings.defaultPremountInSeconds,
			),
			update('setRspack', settings.rspack),
			update('setInteractivityEnabled', settings.interactivityEnabled),
			update(
				'setSequenceActivityLimit',
				committedNumberSettings.sequenceActivityLimit,
			),
			update('setCanvasTabsEnabled', settings.canvasTabsEnabled),
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
	}, [committedNumberSettings, editedSetters, settings]);

	const ready = studioRuntimeConfig !== null && syncedRevision === revision;
	useAutoSaveConfig({
		enabled: ready && studioRuntimeConfig.configFileStudioSettings !== null,
		onError: setError,
		ready,
		syncRevision: syncedRevision,
		updates,
	});

	const editingHighContrast =
		ready && editedSetters.has('setHighContrast') && error === null;
	const highContrast = editingHighContrast
		? settings.highContrast === true
		: (studioRuntimeConfig?.highContrast?.value ?? false);
	useLayoutEffect(() => {
		if (!editingHighContrast) {
			return;
		}

		applyStudioHighContrast(highContrast);
		return () =>
			applyStudioHighContrast(
				window.remotion_studioConfig?.highContrast?.value ?? false,
			);
	}, [editingHighContrast, highContrast]);

	if (studioRuntimeConfig === null) {
		return null;
	}

	const hasConfigFile = studioRuntimeConfig.configFileStudioSettings !== null;
	return (
		<fieldset
			disabled={!hasConfigFile}
			style={hasConfigFile ? container : disabledContainer}
		>
			<p style={dividerLabel}>Interface</p>
			<SettingsRow settingId="interactivityEnabled">
				<div style={rightRow}>
					<Checkbox
						inputId="remotion-setting-interactivityEnabled-control"
						checked={settings.interactivityEnabled !== false}
						name="Interactivity enabled"
						onChange={(event) =>
							changeSetting(
								'interactivityEnabled',
								'setInteractivityEnabled',
								event.target.checked ? null : false,
							)
						}
					/>
				</div>
			</SettingsRow>
			<SettingsRow settingId="canvasTabsEnabled">
				<div style={rightRow}>
					<Checkbox
						inputId="remotion-setting-canvasTabsEnabled-control"
						checked={settings.canvasTabsEnabled !== false}
						name="Composition Tabs"
						onChange={(event) =>
							changeSetting(
								'canvasTabsEnabled',
								'setCanvasTabsEnabled',
								event.target.checked ? null : false,
							)
						}
					/>
				</div>
			</SettingsRow>

			<p style={sectionTitle}>Accessibility</p>
			<SettingsRow settingId="highContrast">
				<div style={{...rightRow, gap: 8}}>
					{studioRuntimeConfig.highContrast?.source === 'cli' ? (
						<span style={{color: LIGHT_TEXT, fontSize: 12}}>
							Set by --high-contrast
						</span>
					) : null}
					<Checkbox
						inputId="remotion-setting-highContrast-control"
						name="High contrast"
						checked={highContrast}
						disabled={studioRuntimeConfig.highContrast?.source === 'cli'}
						onChange={(event) =>
							changeSetting(
								'highContrast',
								'setHighContrast',
								event.target.checked,
							)
						}
					/>
				</div>
			</SettingsRow>

			<p style={sectionTitle}>Timeline</p>
			<SettingsRow settingId="showLayerFrameNumbers">
				<div style={rightRow}>
					<Checkbox
						inputId="remotion-setting-showLayerFrameNumbers-control"
						checked={settings.showLayerFrameNumbers ?? false}
						name="Layer Frame Counters"
						onChange={(event) =>
							changeSetting(
								'showLayerFrameNumbers',
								'setShowLayerFrameNumbers',
								event.target.checked,
							)
						}
					/>
				</div>
			</SettingsRow>
			<SettingsRow settingId="showPremounting">
				<div style={rightRow}>
					<Checkbox
						inputId="remotion-setting-showPremounting-control"
						checked={settings.showPremounting ?? false}
						name={settingsCatalog.showPremounting.name}
						onChange={(event) =>
							changeSetting(
								'showPremounting',
								'setShowPremounting',
								event.target.checked,
							)
						}
					/>
				</div>
			</SettingsRow>
			<SettingsRow settingId="sequenceActivityLimit">
				<div style={{...rightRow, gap: 6}}>
					<RemotionInput
						aria-label="Visualize unmounted components"
						type="text"
						style={{width: 140}}
						onChange={(event) => {
							event.currentTarget.setCustomValidity('');
							setSequenceActivityLimitText(event.currentTarget.value);
						}}
						onBlur={(event) => {
							const text = event.currentTarget.value.trim();
							if (text === '') {
								setSequenceActivityLimitText(
									String(settings.sequenceActivityLimit ?? Infinity),
								);
								return;
							}

							const value =
								text === 'Infinity' ? Infinity : parseInputDraggerNumber(text);
							if (
								value !== Infinity &&
								(value === null || !Number.isSafeInteger(value) || value < 0)
							) {
								event.currentTarget.setCustomValidity(
									'Enter a non-negative safe integer or Infinity.',
								);
								event.currentTarget.reportValidity();
								return;
							}

							event.currentTarget.setCustomValidity('');
							setSequenceActivityLimitText(String(value));
							const limit = value === Infinity ? null : value;
							if (limit !== settings.sequenceActivityLimit) {
								commitNumberSetting(
									'sequenceActivityLimit',
									'setSequenceActivityLimit',
									limit,
								);
							}
						}}
						onKeyDown={(event) => {
							if (event.key === 'Enter') {
								event.currentTarget.blur();
							}

							if (event.key === 'Escape') {
								event.currentTarget.setCustomValidity('');
								setSequenceActivityLimitText(
									String(settings.sequenceActivityLimit ?? Infinity),
								);
							}
						}}
						rightAlign
						status="ok"
						value={sequenceActivityLimitText}
					/>
					<Button
						disabled={settings.sequenceActivityLimit === null}
						onClick={() => {
							setSequenceActivityLimitText('Infinity');
							commitNumberSetting(
								'sequenceActivityLimit',
								'setSequenceActivityLimit',
								null,
							);
						}}
						size="compact"
						style={{color: LIGHT_TEXT}}
						aria-label={`Reset unmounted component visualization limit to ${Internals.DEFAULT_SEQUENCE_ACTIVITY_LIMIT}`}
					>
						<UndoIcon style={resetIcon} />
					</Button>
				</div>
			</SettingsRow>

			<p style={sectionTitle}>Playback</p>
			<SettingsRow settingId="preservePitchOnPlayback">
				<div style={rightRow}>
					<Checkbox
						inputId="remotion-setting-preservePitchOnPlayback-control"
						checked={settings.preservePitchOnPlayback !== false}
						name="Preserve pitch"
						onChange={(event) =>
							changeSetting(
								'preservePitchOnPlayback',
								'setPreservePitchOnPlayback',
								event.target.checked ? null : false,
							)
						}
					/>
				</div>
			</SettingsRow>
			<ConfigNumber
				defaultValue={NoReactInternals.DEFAULT_STUDIO_PREMOUNT_IN_SECONDS}
				settingId="defaultPremountInSeconds"
				step={0.1}
				suffix="sec"
				onChange={(value) =>
					previewNumberSetting('defaultPremountInSeconds', value)
				}
				onChangeEnd={(value) =>
					commitNumberSetting(
						'defaultPremountInSeconds',
						'setDefaultPremountInSeconds',
						value,
					)
				}
				value={settings.defaultPremountInSeconds}
			/>
			<ConfigSelect
				defaultLabel="Playback"
				cliFlag={null}
				settingId="audioLatencyHint"
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
				settingId="numberOfSharedAudioTags"
				step={1}
				suffix={null}
				onChange={(value) =>
					previewNumberSetting('numberOfSharedAudioTags', value)
				}
				onChangeEnd={(value) =>
					commitNumberSetting(
						'numberOfSharedAudioTags',
						'setNumberOfSharedAudioTags',
						value,
					)
				}
				value={settings.numberOfSharedAudioTags}
			/>

			<p style={sectionTitle}>Development</p>
			<ConfigSelect
				defaultLabel="Webpack"
				cliFlag={null}
				settingId="rspack"
				onChange={(value) => changeSetting('rspack', 'setRspack', value)}
				options={[
					{label: 'Rspack', value: true},
					{label: 'Webpack', value: false},
				]}
				value={settings.rspack}
			/>
			<SettingsRow settingId="enableCrossSiteIsolation">
				<div style={rightRow}>
					<Checkbox
						inputId="remotion-setting-enableCrossSiteIsolation-control"
						checked={settings.enableCrossSiteIsolation === true}
						name="Cross-site isolation"
						onChange={(event) =>
							changeSetting(
								'enableCrossSiteIsolation',
								'setEnableCrossSiteIsolation',
								event.target.checked ? true : null,
							)
						}
					/>
				</div>
			</SettingsRow>
			<ConfigSelect<LogLevel>
				defaultLabel="Info"
				cliFlag={null}
				settingId="logLevel"
				onChange={(value) => changeSetting('logLevel', 'setLogLevel', value)}
				options={BrowserSafeApis.logLevels.map((value) => ({
					label: value[0].toUpperCase() + value.slice(1),
					value,
				}))}
				value={settings.logLevel}
			/>
			<p style={sectionTitle}>Debug</p>
			<SettingsRow settingId="showDiagnostics">
				<div style={{...rightRow, gap: 8}}>
					{studioRuntimeConfig.showDiagnostics.source === 'cli' ? (
						<span style={{color: LIGHT_TEXT, fontSize: 12}}>
							Set by --show-diagnostics
						</span>
					) : null}
					<Checkbox
						inputId="remotion-setting-showDiagnostics-control"
						name="Show diagnostics"
						checked={showDiagnostics}
						disabled={studioRuntimeConfig.showDiagnostics.source === 'cli'}
						onChange={(event) => setShowDiagnostics(event.target.checked)}
					/>
				</div>
			</SettingsRow>
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
		</fieldset>
	);
};
