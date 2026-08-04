import type {
	EditorPickerId,
	GetDefaultCodingAgentInfoResponse,
	GetDefaultEditorInfoResponse,
} from '@remotion/studio-shared';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {LIGHT_TEXT, WHITE} from '../helpers/colors';
import {Checkmark} from '../icons/Checkmark';
import {CustomEditorIcon} from '../icons/custom-editor';
import {callApi} from './call-api';
import {Spacing} from './layout';
import {ModalButton} from './ModalButton';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {Combobox} from './NewComposition/ComboBox';
import {ValidationMessage} from './NewComposition/ValidationMessage';
import {SettingsModalFooter} from './SettingsModalFooter';

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
	color: WHITE,
	fontFamily: 'sans-serif',
	fontSize: 14,
	lineHeight: 1.5,
	margin: 0,
};

const comboBoxStyle: React.CSSProperties = {
	boxSizing: 'border-box',
	width: '100%',
};

const customEditorLabel: React.CSSProperties = {
	display: 'inline-flex',
	alignItems: 'center',
	gap: 8,
	maxWidth: '100%',
	minWidth: 0,
	color: 'inherit',
	fontFamily: 'inherit',
	fontSize: 'inherit',
	lineHeight: 'inherit',
};

const customEditorName: React.CSSProperties = {
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

export const DefaultEditorSettings: React.FC<{
	readonly onSaved: () => void;
}> = ({onSaved}) => {
	const [editorInfo, setEditorInfo] =
		useState<GetDefaultEditorInfoResponse | null>(null);
	const [codingAgentInfo, setCodingAgentInfo] =
		useState<GetDefaultCodingAgentInfoResponse | null>(null);
	const [selectedEditor, setSelectedEditor] = useState<EditorPickerId | null>(
		null,
	);
	const [selectedCodingAgent, setSelectedCodingAgent] =
		useState<GetDefaultCodingAgentInfoResponse['defaultCodingAgent']>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
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
					label:
						editor.id === 'custom' ? (
							<span style={customEditorLabel}>
								<CustomEditorIcon size={null} />
								<span style={customEditorName}>{editor.name}</span>
							</span>
						) : (
							editor.name
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
				label: codingAgent.name,
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

	useEffect(() => {
		const controller = new AbortController();
		Promise.all([
			callApi('/api/default-editor-info', {}, controller.signal),
			callApi('/api/default-coding-agent-info', {}, controller.signal),
		])
			.then(([editorResponse, codingAgentResponse]) => {
				setEditorInfo(editorResponse);
				setSelectedEditor(
					editorResponse.defaultEditor !== null &&
						editorResponse.installedEditors.some(
							({id}) => id === editorResponse.defaultEditor,
						)
						? editorResponse.defaultEditor
						: null,
				);
				setCodingAgentInfo(codingAgentResponse);
				setSelectedCodingAgent(
					codingAgentResponse.defaultCodingAgent !== null &&
						codingAgentResponse.installedCodingAgents.some(
							({id}) => id === codingAgentResponse.defaultCodingAgent,
						)
						? codingAgentResponse.defaultCodingAgent
						: null,
				);
			})
			.catch((err) => {
				if (controller.signal.aborted) {
					return;
				}

				setError((err as Error).message);
			});

		return () => controller.abort();
	}, []);

	const submit = useCallback(async () => {
		if (editorInfo === null || codingAgentInfo === null) {
			return;
		}

		setIsSubmitting(true);
		setError(null);
		try {
			const editorResponse = await callApi('/api/update-default-editor', {
				defaultEditor: selectedEditor,
			});
			if (!editorResponse.success) {
				setError(editorResponse.reason);
				setIsSubmitting(false);
				return;
			}

			const codingAgentResponse = await callApi(
				'/api/update-default-coding-agent',
				{defaultCodingAgent: selectedCodingAgent},
			);
			if (!codingAgentResponse.success) {
				setError(codingAgentResponse.reason);
				setIsSubmitting(false);
				return;
			}

			onSaved();
		} catch (err) {
			setError((err as Error).message);
			setIsSubmitting(false);
		}
	}, [
		codingAgentInfo,
		editorInfo,
		onSaved,
		selectedCodingAgent,
		selectedEditor,
	]);

	return (
		<div style={container}>
			<div style={content}>
				<p style={title}>Default editor</p>
				<p style={description}>Used when Remotion Studio opens source files.</p>
				<Spacing y={1} block />
				{editorInfo === null && error === null ? (
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
				<p style={description}>
					Used when Remotion Studio hands a project to a coding agent.
				</p>
				<Spacing y={1} block />
				{codingAgentInfo === null && error === null ? (
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
				{error ? (
					<>
						<Spacing y={1.5} />
						<ValidationMessage
							message={error}
							align="flex-start"
							type="error"
						/>
					</>
				) : null}
			</div>
			<SettingsModalFooter>
				<ModalButton
					onClick={submit}
					disabled={
						isSubmitting || editorInfo === null || codingAgentInfo === null
					}
				>
					{isSubmitting ? 'Saving...' : 'Save and reload'}
				</ModalButton>
			</SettingsModalFooter>
		</div>
	);
};
