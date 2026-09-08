import type {
	ConfigUpdate,
	ConfigValue,
	StudioKeyboardShortcut,
	StudioKeyboardShortcutAction,
	StudioKeyboardShortcuts,
} from '@remotion/studio-shared';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {
	BLACK_ALPHA_60,
	BORDER_WHITE_ALPHA_12,
	INPUT_BACKGROUND,
	LIGHT_TEXT,
	WHITE,
} from '../helpers/colors';
import {getStudioAskAIEnabled} from '../helpers/studio-runtime-config';
import {CaretDown} from '../icons/caret';
import {Checkbox} from './Checkbox';
import {InlineDropdown} from './InlineDropdown';
import {sectionHeader} from './InspectorPanel/styles';
import {
	askAIKeyboardShortcutGroup,
	defaultKeyboardShortcuts,
	formatKeyboardShortcut,
	getKeyboardShortcutsForAction,
	keyboardShortcutGroups,
	keyboardShortcutsOverlap,
	shortcutFromKeyboardEvent,
} from './keyboard-shortcuts';
import {Spacing} from './layout';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {ValidationMessage} from './NewComposition/ValidationMessage';
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

const shortcutSectionTitle: React.CSSProperties = {
	...dividerLabel,
	marginTop: 8,
};

const shortcutRow: React.CSSProperties = {
	alignItems: 'center',
	borderBottom: BORDER_WHITE_ALPHA_12,
	columnGap: 4,
	display: 'grid',
	gridTemplateColumns: 'minmax(0, 1fr) minmax(76px, max-content) 14px',
	margin: '0 16px',
	minHeight: 42,
};

const lastShortcutRow: React.CSSProperties = {
	...shortcutRow,
	borderBottom: 'none',
};

const actionName: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 14,
	lineHeight: 1.4,
	minWidth: 0,
};

const shortcutCell: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	justifyContent: 'flex-end',
	minWidth: 0,
};

const actionCell: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	gap: 6,
	justifyContent: 'flex-start',
	whiteSpace: 'nowrap',
};

const chords: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	gap: 6,
	whiteSpace: 'nowrap',
};

const chord: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	gap: 4,
};

const key: React.CSSProperties = {
	background: INPUT_BACKGROUND,
	border: `1px solid ${BLACK_ALPHA_60}`,
	borderBottomWidth: 2,
	borderRadius: 3,
	color: WHITE,
	fontFamily: 'monospace',
	fontSize: 12,
	lineHeight: '18px',
	minWidth: 18,
	padding: '1px 5px',
	textAlign: 'center',
};

const chordButton: React.CSSProperties = {
	alignItems: 'center',
	background: 'transparent',
	border: 0,
	cursor: 'pointer',
	display: 'flex',
	font: 'inherit',
	margin: 0,
	padding: '4px 0',
};

const alternative: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 11,
};

const emptyShortcut: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 12,
	fontStyle: 'italic',
};

const isSameShortcut = (
	first: StudioKeyboardShortcut,
	second: StudioKeyboardShortcut,
) =>
	first.key.toLowerCase() === second.key.toLowerCase() &&
	(first.commandOrControl ?? false) === (second.commandOrControl ?? false) &&
	(first.shift ?? false) === (second.shift ?? false) &&
	(first.alt ?? false) === (second.alt ?? false);

const ShortcutChords: React.FC<{
	readonly values: readonly (readonly string[])[];
}> = ({values}) => {
	if (values.length === 0) {
		return <span style={emptyShortcut}>Unassigned</span>;
	}

	return (
		<span style={chords}>
			{values.map((keys, chordIndex) => (
				<React.Fragment key={keys.join('-')}>
					{chordIndex > 0 ? <span style={alternative}>or</span> : null}
					<span style={chord}>
						{keys.map((keyboardKey) => (
							<kbd key={keyboardKey} style={key}>
								{keyboardKey}
							</kbd>
						))}
					</span>
				</React.Fragment>
			))}
		</span>
	);
};

export const KeyboardShortcutsSettings: React.FC = () => {
	const {error: settingsError, revision, studioRuntimeConfig} = useSettings();
	const isBrowserStudio = getBrowserStudioOperations() !== null;
	const [enabled, setEnabled] = useState(true);
	const [configuredShortcuts, setConfiguredShortcuts] =
		useState<StudioKeyboardShortcuts>({});
	const [enabledEdited, setEnabledEdited] = useState(false);
	const [shortcutsEdited, setShortcutsEdited] = useState(false);
	const [recording, setRecording] =
		useState<StudioKeyboardShortcutAction | null>(null);
	const [syncedRevision, setSyncedRevision] = useState(-1);
	const [error, setError] = useState<string | null>(null);
	const displayedShortcutGroups = getStudioAskAIEnabled()
		? [...keyboardShortcutGroups, askAIKeyboardShortcutGroup]
		: keyboardShortcutGroups;
	const visibleShortcutGroups = enabled ? displayedShortcutGroups : [];

	useEffect(() => {
		if (studioRuntimeConfig === null) {
			return;
		}

		setEnabled(
			studioRuntimeConfig.configFileStudioSettings?.keyboardShortcutsEnabled !==
				false,
		);
		setConfiguredShortcuts(studioRuntimeConfig.keyboardShortcuts ?? {});
		setEnabledEdited(false);
		setShortcutsEdited(false);
		setRecording(null);
		setSyncedRevision(revision);
		setError(null);
	}, [revision, studioRuntimeConfig]);

	const onEnabledChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			setEnabled(event.target.checked);
			setEnabledEdited(true);
		},
		[],
	);

	const updates = useMemo((): ConfigUpdate[] => {
		const nextUpdates: ConfigUpdate[] = [];
		if (enabledEdited) {
			nextUpdates.push(
				enabled
					? {setter: 'setKeyboardShortcutsEnabled', type: 'delete'}
					: {
							setter: 'setKeyboardShortcutsEnabled',
							type: 'set',
							value: false,
						},
			);
		}

		if (shortcutsEdited) {
			nextUpdates.push(
				Object.keys(configuredShortcuts).length === 0
					? {setter: 'setKeyboardShortcuts', type: 'delete'}
					: {
							setter: 'setKeyboardShortcuts',
							type: 'set',
							value: configuredShortcuts as ConfigValue,
						},
			);
		}

		return nextUpdates;
	}, [configuredShortcuts, enabled, enabledEdited, shortcutsEdited]);

	const ready = studioRuntimeConfig !== null && syncedRevision === revision;
	useAutoSaveConfig({
		enabled: ready && !isBrowserStudio,
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
			{isBrowserStudio ? null : (
				<>
					<p style={dividerLabel}>General</p>
					<label style={optionRow}>
						<div style={label}>Keyboard shortcuts</div>
						<div style={rightRow}>
							<Checkbox
								checked={enabled}
								name="keyboard-shortcuts"
								onChange={onEnabledChange}
							/>
						</div>
					</label>
				</>
			)}
			{visibleShortcutGroups.map((group, groupIndex) => (
				<div key={group.name}>
					<p style={shortcutSectionTitle}>{group.name}</p>
					<div role="list" aria-label={group.name}>
						{group.shortcuts.map((shortcut, shortcutIndex) => {
							const configured =
								shortcut.actionId === null
									? false
									: Object.prototype.hasOwnProperty.call(
											configuredShortcuts,
											shortcut.actionId,
										);
							const shortcutValues =
								shortcut.actionId === null
									? (shortcut.fixedChords ?? [])
									: getKeyboardShortcutsForAction(
											shortcut.actionId,
											configuredShortcuts,
										).map(formatKeyboardShortcut);
							const shortcutButtonId =
								shortcut.actionId === null
									? null
									: `keyboard-shortcut-${shortcut.actionId}`;
							const shortcutMenuItems: ComboboxValue[] =
								shortcut.actionId === null
									? []
									: [
											{
												id: 'remap-shortcut',
												keyHint: null,
												label: 'Remap shortcut',
												leftItem: null,
												onClick: () => {
													setError(null);
													setRecording(shortcut.actionId);
													requestAnimationFrame(() => {
														document.getElementById(shortcutButtonId!)?.focus();
													});
												},
												quickSwitcherLabel: null,
												subMenu: null,
												type: 'item',
												value: 'remap-shortcut',
											},
											...(configured
												? [
														{
															id: 'reset-shortcut',
															keyHint: null,
															label: 'Reset to default',
															leftItem: null,
															onClick: () => {
																setConfiguredShortcuts((current) => {
																	const next = {...current};
																	delete next[shortcut.actionId!];
																	return next;
																});
																setShortcutsEdited(true);
															},
															quickSwitcherLabel: null,
															subMenu: null,
															type: 'item' as const,
															value: 'reset-shortcut',
														},
													]
												: []),
											...(configuredShortcuts[shortcut.actionId] !== null
												? [
														{
															id: 'disable-shortcut',
															keyHint: null,
															label: 'Disable shortcut',
															leftItem: null,
															onClick: () => {
																setConfiguredShortcuts((current) => ({
																	...current,
																	[shortcut.actionId!]: null,
																}));
																setShortcutsEdited(true);
															},
															quickSwitcherLabel: null,
															subMenu: null,
															type: 'item' as const,
															value: 'disable-shortcut',
														},
													]
												: []),
										];

							return (
								<div
									key={shortcut.action}
									role="listitem"
									style={
										groupIndex === displayedShortcutGroups.length - 1 &&
										shortcutIndex === group.shortcuts.length - 1
											? lastShortcutRow
											: shortcutRow
									}
								>
									<span style={actionName}>{shortcut.action}</span>
									{shortcut.actionId === null || isBrowserStudio ? (
										<>
											<span style={shortcutCell}>
												<ShortcutChords values={shortcutValues} />
											</span>
											<span />
										</>
									) : (
										<>
											<span style={shortcutCell}>
												<button
													id={shortcutButtonId!}
													type="button"
													style={chordButton}
													aria-label={`Change shortcut for ${shortcut.action}`}
													onClick={() => {
														setError(null);
														setRecording(shortcut.actionId);
													}}
													onKeyDown={(event) => {
														if (recording !== shortcut.actionId) return;
														event.preventDefault();
														event.stopPropagation();
														if (event.key === 'Escape') {
															setRecording(null);
															return;
														}

														const value = shortcutFromKeyboardEvent(
															event.nativeEvent,
														);
														if (value === null) return;
														const conflict = displayedShortcutGroups
															.flatMap((item) => item.shortcuts)
															.find(
																(item) =>
																	item.actionId !== null &&
																	item.actionId !== shortcut.actionId &&
																	getKeyboardShortcutsForAction(
																		item.actionId,
																		configuredShortcuts,
																	).some((candidate) =>
																		keyboardShortcutsOverlap(candidate, value),
																	),
															);
														if (conflict) {
															setError(
																`Shortcut is already used by “${conflict.action}”.`,
															);
															return;
														}

														setConfiguredShortcuts((current) => {
															if (
																defaultKeyboardShortcuts[
																	shortcut.actionId!
																].some((defaultShortcut) =>
																	isSameShortcut(defaultShortcut, value),
																)
															) {
																const next = {...current};
																delete next[shortcut.actionId!];
																return next;
															}

															return {
																...current,
																[shortcut.actionId!]: value,
															};
														});
														setShortcutsEdited(true);
														setRecording(null);
													}}
												>
													{recording === shortcut.actionId ? (
														<span style={emptyShortcut}>Press shortcut…</span>
													) : (
														<ShortcutChords values={shortcutValues} />
													)}
												</button>
											</span>
											<span style={actionCell}>
												<InlineDropdown
													renderAction={(color) => <CaretDown color={color} />}
													title={`Actions for ${shortcut.action}`}
													values={shortcutMenuItems}
													variant="compact"
												/>
											</span>
										</>
									)}
								</div>
							);
						})}
					</div>
				</div>
			))}
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
		</div>
	);
};
