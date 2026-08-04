import type {
	EditorPickerId,
	GetDefaultEditorInfoResponse,
} from '@remotion/studio-shared';
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import {LIGHT_TEXT} from '../helpers/colors';
import {Checkmark} from '../icons/Checkmark';
import {CustomEditorIcon} from '../icons/custom-editor';
import {SetSelectedModalContext} from '../state/modals';
import {callApi} from './call-api';
import {Row, Spacing} from './layout';
import {ModalButton} from './ModalButton';
import {ModalContainer} from './ModalContainer';
import {ModalFooterContainer} from './ModalFooter';
import {ModalHeader} from './ModalHeader';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {Combobox} from './NewComposition/ComboBox';
import {ValidationMessage} from './NewComposition/ValidationMessage';

const content: React.CSSProperties = {
	padding: 16,
	width: 440,
	maxWidth: 'calc(100vw - 40px)',
};

const description: React.CSSProperties = {
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

export const ConfigureDefaultEditorModal: React.FC = () => {
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const [editorInfo, setEditorInfo] =
		useState<GetDefaultEditorInfoResponse | null>(null);
	const [selectedEditor, setSelectedEditor] = useState<EditorPickerId | null>(
		null,
	);
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

	const dismiss = useCallback(() => {
		setSelectedModal(null);
	}, [setSelectedModal]);

	useEffect(() => {
		const controller = new AbortController();
		callApi('/api/default-editor-info', {}, controller.signal)
			.then((response) => {
				setEditorInfo(response);
				setSelectedEditor(
					response.defaultEditor !== null &&
						response.installedEditors.some(
							({id}) => id === response.defaultEditor,
						)
						? response.defaultEditor
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
		if (editorInfo === null) {
			return;
		}

		setIsSubmitting(true);
		setError(null);
		try {
			const response = await callApi('/api/update-default-editor', {
				defaultEditor: selectedEditor,
			});
			if (!response.success) {
				setError(response.reason);
				setIsSubmitting(false);
				return;
			}

			dismiss();
		} catch (err) {
			setError((err as Error).message);
			setIsSubmitting(false);
		}
	}, [dismiss, editorInfo, selectedEditor]);

	if (editorInfo === null && error === null) {
		return null;
	}

	return (
		<ModalContainer onEscape={dismiss} onOutsideClick={dismiss}>
			<ModalHeader title="Configure default editor" onClose={dismiss} />
			<div style={content}>
				<p style={description}>This setting gets saved to your config file.</p>
				<Spacing y={2} block />
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
			<ModalFooterContainer>
				<Row justify="flex-end">
					<ModalButton
						onClick={submit}
						disabled={isSubmitting || editorInfo === null}
					>
						{isSubmitting ? 'Saving...' : 'Save and reload'}
					</ModalButton>
				</Row>
			</ModalFooterContainer>
		</ModalContainer>
	);
};
