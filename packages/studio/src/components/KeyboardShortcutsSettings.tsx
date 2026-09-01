import type {ConfigUpdate} from '@remotion/studio-shared';
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
import {booleanOptions, ConfigSelect} from './ConfigSelect';
import {sectionHeader} from './InspectorPanel/styles';
import {
	askAIKeyboardShortcutGroup,
	keyboardShortcutGroups,
} from './keyboard-shortcuts';
import {Spacing} from './layout';
import {ValidationMessage} from './NewComposition/ValidationMessage';
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
	display: 'flex',
	gap: 16,
	justifyContent: 'space-between',
	margin: '0 16px',
	minHeight: 38,
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

const chords: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	flexShrink: 0,
	gap: 6,
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

const alternative: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 11,
};

export const KeyboardShortcutsSettings: React.FC = () => {
	const {error: settingsError, revision, studioRuntimeConfig} = useSettings();
	const isBrowserStudio = getBrowserStudioOperations() !== null;
	const [enabled, setEnabled] = useState<boolean | null>(null);
	const [edited, setEdited] = useState(false);
	const [syncedRevision, setSyncedRevision] = useState(-1);
	const [error, setError] = useState<string | null>(null);
	const displayedShortcutGroups = getStudioAskAIEnabled()
		? [...keyboardShortcutGroups, askAIKeyboardShortcutGroup]
		: keyboardShortcutGroups;

	useEffect(() => {
		if (studioRuntimeConfig === null) {
			return;
		}

		setEnabled(
			studioRuntimeConfig.configFileStudioSettings?.keyboardShortcutsEnabled ??
				null,
		);
		setEdited(false);
		setSyncedRevision(revision);
		setError(null);
	}, [revision, studioRuntimeConfig]);

	const onEnabledChange = useCallback((value: boolean | null) => {
		setEnabled(value);
		setEdited(true);
	}, []);

	const updates = useMemo((): ConfigUpdate[] => {
		if (!edited) {
			return [];
		}

		return enabled === null
			? [{setter: 'setKeyboardShortcutsEnabled', type: 'delete'}]
			: [
					{
						setter: 'setKeyboardShortcutsEnabled',
						type: 'set',
						value: enabled,
					},
				];
	}, [edited, enabled]);

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
					<ConfigSelect
						defaultLabel="Enabled"
						name="Keyboard shortcuts"
						onChange={onEnabledChange}
						options={booleanOptions}
						value={enabled}
					/>
				</>
			)}
			{displayedShortcutGroups.map((group, groupIndex) => (
				<div key={group.name}>
					<p style={shortcutSectionTitle}>{group.name}</p>
					<div role="list" aria-label={group.name}>
						{group.shortcuts.map((shortcut, shortcutIndex) => (
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
								<span style={chords}>
									{shortcut.chords.map((keys, chordIndex) => (
										<React.Fragment key={keys.join('-')}>
											{chordIndex > 0 ? (
												<span style={alternative}>or</span>
											) : null}
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
							</div>
						))}
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
