import type {DefaultEditor} from '@remotion/renderer';
import type {GetDefaultEditorInfoResponse} from '@remotion/studio-shared';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {LIGHT_TEXT} from '../helpers/colors';
import {ModalsContext} from '../state/modals';
import {callApi} from './call-api';
import {Checkbox} from './Checkbox';
import {Row, Spacing} from './layout';
import {ModalButton} from './ModalButton';
import {ModalContainer} from './ModalContainer';
import {ModalFooterContainer} from './ModalFooter';
import {ModalHeader} from './ModalHeader';
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

const editorRow: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	cursor: 'pointer',
	marginTop: 5,
	marginBottom: 5,
};

const editorLabel: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontFamily: 'sans-serif',
	fontSize: 14,
	lineHeight: '20px',
	cursor: 'pointer',
	minWidth: 0,
	overflow: 'hidden',
	textOverflow: 'ellipsis',
	whiteSpace: 'nowrap',
	userSelect: 'none',
};

export const ConfigureDefaultEditorModal: React.FC = () => {
	const {setSelectedModal} = useContext(ModalsContext);
	const [editorInfo, setEditorInfo] =
		useState<GetDefaultEditorInfoResponse | null>(null);
	const [selectedEditor, setSelectedEditor] = useState<DefaultEditor | null>(
		null,
	);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const dismiss = useCallback(() => {
		setSelectedModal(null);
	}, [setSelectedModal]);

	useEffect(() => {
		const controller = new AbortController();
		callApi('/api/default-editor-info', {}, controller.signal)
			.then((response) => {
				setEditorInfo(response);
				setSelectedEditor(
					response.installedEditors.some(
						({id}) => id === response.defaultEditor,
					)
						? response.defaultEditor
						: (response.installedEditors[0]?.id ?? null),
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
		if (selectedEditor === null) {
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
	}, [dismiss, selectedEditor]);

	return (
		<ModalContainer onEscape={dismiss} onOutsideClick={dismiss}>
			<ModalHeader title="Configure default editor" onClose={dismiss} />
			<div style={content}>
				<p style={description}>
					Select the editor Remotion Studio should use when opening source
					files.
				</p>
				<Spacing y={2} />
				{editorInfo === null && error === null ? (
					<p style={description}>Detecting installed editors...</p>
				) : null}
				{editorInfo?.installedEditors.length === 0 ? (
					<p style={description}>
						No supported editors were found on this computer.
					</p>
				) : null}
				{editorInfo?.installedEditors.map((editor) => {
					const chooseEditor = () => {
						setSelectedEditor(editor.id);
						setError(null);
					};

					return (
						<div key={editor.id} style={editorRow} onClick={chooseEditor}>
							<Checkbox
								checked={selectedEditor === editor.id}
								onChange={chooseEditor}
								name={`default-editor-${editor.id}`}
								rounded
							/>
							<Spacing x={1} />
							<div style={editorLabel}>{editor.name}</div>
						</div>
					);
				})}
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
						disabled={isSubmitting || selectedEditor === null}
					>
						{isSubmitting ? 'Saving...' : 'Save and reload'}
					</ModalButton>
				</Row>
			</ModalFooterContainer>
		</ModalContainer>
	);
};
