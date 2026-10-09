import type {LogLevel} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import type {
	ConfigFileStudioSettings,
	ConfigUpdate,
} from '@remotion/studio-shared';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {Internals} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {LIGHT_TEXT} from '../helpers/colors';
import {UndoIcon} from '../icons/undo';
import {Button} from './Button';
import {Checkbox} from './Checkbox';
import {ConfigSelect} from './ConfigSelect';
import {sectionHeader} from './InspectorPanel/styles';
import {Spacing} from './layout';
import {InputDragger} from './NewComposition/InputDragger';
import {ValidationMessage} from './NewComposition/ValidationMessage';
import {InfoBubble} from './RenderModal/InfoBubble';
import {label, optionRow, rightRow} from './RenderModal/layout';
import {useSettings} from './SettingsContext';
import {useAutoSaveConfig} from './use-auto-save-config';

const container: React.CSSProperties = {
	alignSelf: 'flex-start',
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

const sectionTitle: React.CSSProperties = {
	...dividerLabel,
	marginTop: 8,
};

const resetIcon: React.CSSProperties = {
	height: 12,
	width: 12,
};

const initialSettings: ConfigFileStudioSettings = {
	showPremounting: null,
	defaultPremountInSeconds: null,
	askAIEnabled: null,
	audioLatencyHint: null,
	beepOnFinish: null,
	enableCrossSiteIsolation: null,
	experimentalTracksEnabled: null,
	experimentalSequenceActivityEnabled: null,
	experimentalSequenceActivityLimit: null,
	interactivityEnabled: null,
	keyboardShortcutsEnabled: null,
	logLevel: null,
	maxTimelineTracks: null,
	numberOfSharedAudioTags: null,
	rspack: null,
	canvasTabsEnabled: null,
};

const ConfigNumber = ({
	defaultValue,
	name,
	onChange,
	onChangeEnd,
	value,
	step,
}: {
	readonly defaultValue: number;
	readonly step: number;
	readonly name: string;
	readonly onChange: (value: number | null) => void;
	readonly onChangeEnd: (value: number | null) => void;
	readonly value: number | null;
}) => {
	return (
		<div style={optionRow}>
			<div style={label}>{name}</div>
			<div style={{...rightRow, gap: 6}}>
				<InputDragger
					aria-label={name}
					buttonStyle={{textAlign: 'right', width: 140}}
					formatter={() =>
						value === null ? `Default (${defaultValue})` : String(value)
					}
					min={0}
					onTextChange={() => undefined}
					onValueChange={onChange}
					onValueChangeEnd={onChangeEnd}
					placeholder={`Default (${defaultValue})`}
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
					aria-label={`Use default (${defaultValue})`}
				>
					<UndoIcon style={resetIcon} />
				</Button>
			</div>
		</div>
	);
};

export const StudioSettings: React.FC = () => {
	const {error: settingsError, revision, studioRuntimeConfig} = useSettings();
	const [settings, setSettings] =
		useState<ConfigFileStudioSettings>(initialSettings);
	const [committedNumberSettings, setCommittedNumberSettings] = useState<{
		numberOfSharedAudioTags: number | null;
		defaultPremountInSeconds: number | null;
		experimentalSequenceActivityLimit: number | null;
	}>({
		numberOfSharedAudioTags: null,
		defaultPremountInSeconds: null,
		experimentalSequenceActivityLimit: null,
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
		setCommittedNumberSettings({
			experimentalSequenceActivityLimit:
				studioRuntimeConfig.configFileStudioSettings
					?.experimentalSequenceActivityLimit ?? null,
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
				| 'experimentalSequenceActivityLimit',
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
				| 'experimentalSequenceActivityLimit',
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
			update('setShowPremounting', settings.showPremounting),
			update('setAskAIEnabled', settings.askAIEnabled),
			update('setEnableCrossSiteIsolation', settings.enableCrossSiteIsolation),
			update('setBeepOnFinish', settings.beepOnFinish),
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
				'setExperimentalTracksEnabled',
				settings.experimentalTracksEnabled,
			),
			update(
				'setExperimentalSequenceActivityEnabled',
				settings.experimentalSequenceActivityEnabled,
			),
			update(
				'setExperimentalSequenceActivityLimit',
				committedNumberSettings.experimentalSequenceActivityLimit,
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
			<div style={optionRow}>
				<div style={label}>
					Cross-site isolation
					<InfoBubble
						aria-label="About cross-site isolation"
						horizontalAlignment="right"
					>
						<div
							style={{
								padding: 12,
								maxWidth: 280,
								fontSize: 14,
								lineHeight: 1.5,
							}}
						>
							Isolates Studio from other websites to enable shared memory and
							multithreading. Required for @remotion/whisper-web and can speed
							up ProRes decoding. Media from other websites that requires
							cookies or authentication may not load. Disabled by default.
						</div>
					</InfoBubble>
				</div>
				<label style={rightRow} aria-label="Cross-site isolation">
					<Checkbox
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
				</label>
			</div>
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

			<p style={sectionTitle}>Interface</p>
			<label style={optionRow}>
				<div style={label}>Show premounting in timeline</div>
				<div style={rightRow}>
					<Checkbox
						checked={settings.showPremounting ?? true}
						name="Show premounting in timeline"
						onChange={(event) =>
							changeSetting(
								'showPremounting',
								'setShowPremounting',
								event.target.checked,
							)
						}
					/>
				</div>
			</label>
			<label style={optionRow}>
				<div style={label}>Ask AI enabled</div>
				<div style={rightRow}>
					<Checkbox
						checked={settings.askAIEnabled !== false}
						name="Ask AI enabled"
						onChange={(event) =>
							changeSetting(
								'askAIEnabled',
								'setAskAIEnabled',
								event.target.checked ? null : false,
							)
						}
					/>
				</div>
			</label>
			<label style={optionRow}>
				<div style={label}>Tabs above Canvas</div>
				<div style={rightRow}>
					<Checkbox
						checked={settings.canvasTabsEnabled !== false}
						name="Tabs above Canvas"
						onChange={(event) =>
							changeSetting(
								'canvasTabsEnabled',
								'setCanvasTabsEnabled',
								event.target.checked ? null : false,
							)
						}
					/>
				</div>
			</label>
			<label style={optionRow}>
				<div style={label}>Interactivity enabled</div>
				<div style={rightRow}>
					<Checkbox
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
			</label>

			<div style={optionRow}>
				<div style={label}>
					Experimental tracks
					<InfoBubble
						aria-label="About experimental tracks"
						horizontalAlignment="right"
					>
						<div
							style={{
								padding: 12,
								maxWidth: 280,
								fontSize: 14,
								lineHeight: 1.5,
							}}
						>
							Groups Track, Series, and TransitionSeries clips on shared
							timeline rows, with extra rows for overlays. Disabled by default.
							Changes apply immediately after saving, without reloading Studio.
						</div>
					</InfoBubble>
				</div>
				<label style={rightRow} aria-label="Experimental tracks">
					<Checkbox
						checked={settings.experimentalTracksEnabled === true}
						name="Experimental tracks"
						onChange={(event) =>
							changeSetting(
								'experimentalTracksEnabled',
								'setExperimentalTracksEnabled',
								event.target.checked ? true : null,
							)
						}
					/>
				</label>
			</div>

			<p style={sectionTitle}>Playback</p>
			<ConfigNumber
				defaultValue={NoReactInternals.DEFAULT_PREMOUNT_IN_SECONDS}
				name="Default premount in seconds"
				step={0.1}
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
			<div style={optionRow}>
				<div style={label}>
					Sequence Activity (experimental)
					<InfoBubble
						aria-label="About experimental Sequence Activity"
						horizontalAlignment="right"
					>
						<div
							style={{
								padding: 12,
								maxWidth: 280,
								fontSize: 14,
								lineHeight: 1.5,
							}}
						>
							Discovers layers in nearby scenes before they become visible. This
							experimental feature may use more CPU. Changes apply immediately
							and are saved in remotion.config.ts.
						</div>
					</InfoBubble>
				</div>
				<label style={rightRow} aria-label="Sequence Activity (experimental)">
					<Checkbox
						checked={settings.experimentalSequenceActivityEnabled === true}
						name="Sequence Activity (experimental)"
						onChange={(event) =>
							changeSetting(
								'experimentalSequenceActivityEnabled',
								'setExperimentalSequenceActivityEnabled',
								event.target.checked ? true : null,
							)
						}
					/>
				</label>
			</div>
			{settings.experimentalSequenceActivityEnabled === true ? (
				<div style={optionRow}>
					<div style={label}>
						Hidden activity limit (experimental)
						<InfoBubble
							aria-label="About the hidden activity limit"
							horizontalAlignment="right"
						>
							<div
								style={{
									padding: 12,
									maxWidth: 280,
									fontSize: 14,
									lineHeight: 1.5,
								}}
							>
								Limits nearby hidden scenes, including nested sequences and
								their ancestors. Visible, premounted, and postmounted scenes
								always render. Set to 0 to disable hidden discovery, or -1 for
								unlimited discovery without admission delays. Default:{' '}
								{Internals.DEFAULT_SEQUENCE_ACTIVITY_LIMIT}.
							</div>
						</InfoBubble>
					</div>
					<div style={{...rightRow, gap: 6}}>
						<InputDragger
							aria-label="Hidden activity limit (experimental)"
							buttonStyle={{textAlign: 'right', width: 140}}
							formatter={() =>
								settings.experimentalSequenceActivityLimit === null
									? `Default (${Internals.DEFAULT_SEQUENCE_ACTIVITY_LIMIT})`
									: String(settings.experimentalSequenceActivityLimit)
							}
							integerOnly
							max={Number.MAX_SAFE_INTEGER}
							min={-1}
							onTextChange={() => undefined}
							onValueChange={(value) =>
								previewNumberSetting('experimentalSequenceActivityLimit', value)
							}
							onValueChangeEnd={(value) =>
								commitNumberSetting(
									'experimentalSequenceActivityLimit',
									'setExperimentalSequenceActivityLimit',
									value,
								)
							}
							rightAlign
							status="ok"
							step={1}
							value={
								settings.experimentalSequenceActivityLimit ??
								Internals.DEFAULT_SEQUENCE_ACTIVITY_LIMIT
							}
						/>
						<Button
							disabled={settings.experimentalSequenceActivityLimit === null}
							onClick={() =>
								commitNumberSetting(
									'experimentalSequenceActivityLimit',
									'setExperimentalSequenceActivityLimit',
									null,
								)
							}
							size="compact"
							style={{color: LIGHT_TEXT}}
							aria-label={`Reset hidden activity limit to ${Internals.DEFAULT_SEQUENCE_ACTIVITY_LIMIT}`}
						>
							<UndoIcon style={resetIcon} />
						</Button>
					</div>
				</div>
			) : null}

			<p style={sectionTitle}>Audio</p>
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
				step={1}
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
			<label style={optionRow}>
				<div style={label}>Beep on finish</div>
				<div style={rightRow}>
					<Checkbox
						checked={settings.beepOnFinish === true}
						name="Beep on finish"
						onChange={(event) =>
							changeSetting(
								'beepOnFinish',
								'setBeepOnFinish',
								event.target.checked ? true : null,
							)
						}
					/>
				</div>
			</label>
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
