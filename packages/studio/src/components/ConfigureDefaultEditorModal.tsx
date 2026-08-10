import type {
	ConfigUpdate,
	EditorPickerId,
	GetDefaultCodingAgentInfoResponse,
} from '@remotion/studio-shared';
import React, {useEffect, useMemo, useState} from 'react';
import {LIGHT_TEXT} from '../helpers/colors';
import {Checkmark} from '../icons/Checkmark';
import {EditorIcon} from '../icons/editor';
import {TerminalIcon} from '../icons/terminal';
import {CodingAgentIcon} from './CodingAgentIcon';
import {Spacing} from './layout';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {Combobox} from './NewComposition/ComboBox';
import {ValidationMessage} from './NewComposition/ValidationMessage';
import {useSettings} from './SettingsContext';
import {useAutoSaveConfig} from './use-auto-save-config';

const container: React.CSSProperties = {
	display: 'flex',
	flex: 1,
	flexDirection: 'column',
	minWidth: 0,
};

const content: React.CSSProperties = {
	flex: 1,
	padding: 16,
};

const description: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 14,
	lineHeight: 1.5,
	margin: 0,
};

const title: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 14,
	lineHeight: 1.5,
	margin: 0,
};

const comboBoxStyle: React.CSSProperties = {
	boxSizing: 'border-box',
	width: '100%',
};

const appLabel: React.CSSProperties = {
	display: 'flex',
	alignItems: 'center',
	gap: 8,
	maxWidth: '100%',
	minWidth: 0,
	color: 'inherit',
	fontFamily: 'inherit',
	fontSize: 'inherit',
	lineHeight: 'inherit',
};

const appName: React.CSSProperties = {
	minWidth: 0,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
	color: 'inherit',
	fontFamily: 'inherit',
	fontSize: 'inherit',
	lineHeight: 'inherit',
};

const NO_PREFERENCE_ID = 'no-preference';

export const DefaultEditorSettings: React.FC = () => {
	const {
		codingAgentInfo,
		editorInfo,
		error: settingsError,
		revision,
	} = useSettings();
	const [selectedEditor, setSelectedEditor] = useState<EditorPickerId | null>(
		null,
	);
	const [selectedCodingAgent, setSelectedCodingAgent] =
		useState<GetDefaultCodingAgentInfoResponse['defaultCodingAgent']>(null);
	const [selectedTerminal, setSelectedTerminal] =
		useState<GetDefaultCodingAgentInfoResponse['defaultTerminal']>(null);
	const [syncedRevision, setSyncedRevision] = useState(-1);
	const [error, setError] = useState<string | null>(null);
	const editorValues = useMemo((): ComboboxValue[] => {
		const noPreference: ComboboxValue = {
			id: NO_PREFERENCE_ID,
			keyHint: null,
			label: 'No preference',
			leftItem: selectedEditor === null ? <Checkmark /> : null,
			onClick: () => {
				setSelectedEditor(null);
				setError(null);
			},
			quickSwitcherLabel: null,
			subMenu: null,
			type: 'item',
			value: NO_PREFERENCE_ID,
		};
		const installedEditors = (editorInfo?.installedEditors ?? []).map(
			(editor): ComboboxValue => {
				return {
					id: editor.id,
					keyHint: null,
					label: (
						<span style={appLabel}>
							<EditorIcon editorId={editor.id} size={18} />
							<span style={appName}>{editor.name}</span>
						</span>
					),
					leftItem: selectedEditor === editor.id ? <Checkmark /> : null,
					onClick: () => {
						setSelectedEditor(editor.id);
						setError(null);
					},
					quickSwitcherLabel: null,
					subMenu: null,
					type: 'item',
					value: editor.id,
				};
			},
		);

		return [noPreference, ...installedEditors];
	}, [editorInfo?.installedEditors, selectedEditor]);
	const codingAgentValues = useMemo((): ComboboxValue[] => {
		const noPreference: ComboboxValue = {
			id: NO_PREFERENCE_ID,
			keyHint: null,
			label: 'No preference',
			leftItem: selectedCodingAgent === null ? <Checkmark /> : null,
			onClick: () => {
				setSelectedCodingAgent(null);
				setError(null);
			},
			quickSwitcherLabel: null,
			subMenu: null,
			type: 'item',
			value: NO_PREFERENCE_ID,
		};
		const installedCodingAgents = (
			codingAgentInfo?.installedCodingAgents ?? []
		).map((codingAgent): ComboboxValue => {
			return {
				id: codingAgent.id,
				keyHint: null,
				label: (
					<span style={appLabel}>
						<CodingAgentIcon codingAgentId={codingAgent.id} size={18} />
						<span style={appName}>{codingAgent.name}</span>
					</span>
				),
				leftItem: selectedCodingAgent === codingAgent.id ? <Checkmark /> : null,
				onClick: () => {
					setSelectedCodingAgent(codingAgent.id);
					setError(null);
				},
				quickSwitcherLabel: null,
				subMenu: null,
				type: 'item',
				value: codingAgent.id,
			};
		});

		return [noPreference, ...installedCodingAgents];
	}, [codingAgentInfo?.installedCodingAgents, selectedCodingAgent]);
	const terminalValues = useMemo((): ComboboxValue[] => {
		const noPreference: ComboboxValue = {
			id: NO_PREFERENCE_ID,
			keyHint: null,
			label: 'No preference',
			leftItem: selectedTerminal === null ? <Checkmark /> : null,
			onClick: () => {
				setSelectedTerminal(null);
				setError(null);
			},
			quickSwitcherLabel: null,
			subMenu: null,
			type: 'item',
			value: NO_PREFERENCE_ID,
		};
		const installedTerminals = (codingAgentInfo?.installedTerminals ?? []).map(
			(terminal): ComboboxValue => {
				return {
					id: terminal.id,
					keyHint: null,
					label: (
						<span style={appLabel}>
							<TerminalIcon terminalId={terminal.id} size={18} />
							<span style={appName}>{terminal.name}</span>
						</span>
					),
					leftItem: selectedTerminal === terminal.id ? <Checkmark /> : null,
					onClick: () => {
						setSelectedTerminal(terminal.id);
						setError(null);
					},
					quickSwitcherLabel: null,
					subMenu: null,
					type: 'item',
					value: terminal.id,
				};
			},
		);

		return [noPreference, ...installedTerminals];
	}, [codingAgentInfo?.installedTerminals, selectedTerminal]);

	useEffect(() => {
		if (editorInfo === null || codingAgentInfo === null) {
			return;
		}

		setSelectedEditor(
			editorInfo.defaultEditor !== null &&
				editorInfo.installedEditors.some(
					({id}) => id === editorInfo.defaultEditor,
				)
				? editorInfo.defaultEditor
				: null,
		);
		setSelectedCodingAgent(
			codingAgentInfo.defaultCodingAgent !== null &&
				codingAgentInfo.installedCodingAgents.some(
					({id}) => id === codingAgentInfo.defaultCodingAgent,
				)
				? codingAgentInfo.defaultCodingAgent
				: null,
		);
		setSelectedTerminal(
			codingAgentInfo.defaultTerminal !== null &&
				codingAgentInfo.installedTerminals.some(
					({id}) => id === codingAgentInfo.defaultTerminal,
				)
				? codingAgentInfo.defaultTerminal
				: null,
		);
		setSyncedRevision(revision);
		setError(null);
	}, [codingAgentInfo, editorInfo, revision]);

	const updates = useMemo((): ConfigUpdate[] => {
		// The browser only receives an opaque ID for a custom editor. Omitting the
		// update preserves its executable and arguments in the existing config call.
		const editorUpdate: ConfigUpdate[] =
			selectedEditor === 'custom'
				? []
				: [
						selectedEditor === null
							? {setter: 'setDefaultEditor', type: 'delete'}
							: {
									setter: 'setDefaultEditor',
									type: 'set',
									value: selectedEditor,
								},
					];

		return [
			...editorUpdate,
			selectedCodingAgent === null
				? {setter: 'setDefaultCodingAgent', type: 'delete'}
				: {
						setter: 'setDefaultCodingAgent',
						type: 'set',
						value: selectedCodingAgent,
					},
			selectedTerminal === null
				? {setter: 'setDefaultTerminal', type: 'delete'}
				: {
						setter: 'setDefaultTerminal',
						type: 'set',
						value: selectedTerminal,
					},
		];
	}, [selectedCodingAgent, selectedEditor, selectedTerminal]);
	const ready =
		editorInfo !== null &&
		codingAgentInfo !== null &&
		syncedRevision === revision;
	useAutoSaveConfig({
		enabled: ready,
		onError: setError,
		ready,
		syncRevision: syncedRevision,
		updates,
	});
	const displayedError = error ?? settingsError;

	return (
		<div style={container}>
			<div style={content}>
				<p style={title}>Default editor</p>
				<Spacing y={1} block />
				{editorInfo === null && displayedError === null ? (
					<p style={description}>Loading installed editors...</p>
				) : null}
				{editorInfo?.installedEditors.length === 0 ? (
					<p style={description}>
						No supported editors were found on this computer.
					</p>
				) : null}
				{editorInfo === null ? null : (
					<Combobox
						values={editorValues}
						selectedId={selectedEditor ?? NO_PREFERENCE_ID}
						style={comboBoxStyle}
						title="Default editor"
					/>
				)}
				<Spacing y={2} block />
				<p style={title}>Default coding agent</p>
				<Spacing y={1} block />
				{codingAgentInfo === null && displayedError === null ? (
					<p style={description}>Loading installed coding agents...</p>
				) : null}
				{codingAgentInfo?.installedCodingAgents.length === 0 ? (
					<p style={description}>
						No supported coding agents were found on this computer.
					</p>
				) : null}
				{codingAgentInfo === null ? null : (
					<Combobox
						values={codingAgentValues}
						selectedId={selectedCodingAgent ?? NO_PREFERENCE_ID}
						style={comboBoxStyle}
						title="Default coding agent"
					/>
				)}
				<Spacing y={2} block />
				<p style={title}>Default terminal</p>
				<Spacing y={1} block />
				{codingAgentInfo === null && displayedError === null ? (
					<p style={description}>Loading installed terminals...</p>
				) : null}
				{codingAgentInfo?.installedTerminals.length === 0 ? (
					<p style={description}>
						No supported terminals were found on this computer.
					</p>
				) : null}
				{codingAgentInfo === null ? null : (
					<Combobox
						values={terminalValues}
						selectedId={selectedTerminal ?? NO_PREFERENCE_ID}
						style={comboBoxStyle}
						title="Default terminal"
					/>
				)}
				{displayedError ? (
					<>
						<Spacing y={1.5} />
						<ValidationMessage
							message={displayedError}
							align="flex-start"
							type="error"
						/>
					</>
				) : null}
			</div>
		</div>
	);
};
