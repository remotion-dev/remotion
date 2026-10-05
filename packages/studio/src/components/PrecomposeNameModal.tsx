import React, {useCallback, useContext, useState} from 'react';
import {Internals} from 'remotion';
import type {ModalState} from '../state/modals';
import {SetSelectedModalContext} from '../state/modals';
import {Button} from './Button';
import {selectCompositionWhenReady} from './InitialCompositionLoader';
import {Row, Spacing} from './layout';
import {ModalFooterContainer} from './ModalFooter';
import {ModalHeader} from './ModalHeader';
import {DismissableModal} from './NewComposition/DismissableModal';
import {RemotionInput} from './NewComposition/RemInput';
import {ValidationMessage} from './NewComposition/ValidationMessage';
import {showNotification} from './Notifications/NotificationCenter';
import {precomposeJsxNodes} from './precompose-jsx-nodes-api';
import {label, optionRow, rightRow} from './RenderModal/layout';

const content: React.CSSProperties = {
	padding: 12,
	paddingRight: 12,
	flex: 1,
	fontSize: 13,
	minWidth: 500,
};

type State = Extract<ModalState, {type: 'precompose-name'}>;

export const PrecomposeNameModal: React.FC<{readonly state: State}> = ({
	state,
}) => {
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const [newCompositionId, setNewCompositionId] = useState(() => {
		let candidate = 'Precomposition';
		let suffix = 2;
		while (state.request.existingCompositionIds.includes(candidate)) {
			candidate = `Precomposition${suffix}`;
			suffix++;
		}

		return candidate;
	});
	const [submitting, setSubmitting] = useState(false);
	const [serverError, setServerError] = useState<string | null>(null);
	const validationMessage = !Internals.isCompositionIdValid(newCompositionId)
		? Internals.invalidCompositionErrorMessage
		: state.request.existingCompositionIds.includes(newCompositionId)
			? `Composition "${newCompositionId}" already exists`
			: serverError;
	const valid = validationMessage === null;

	const onPrecompose = useCallback(() => {
		if (!valid || submitting) {
			return;
		}

		setSubmitting(true);
		precomposeJsxNodes({...state.request, newCompositionId})
			.then((result) => {
				if (!result.success) {
					showNotification(result.reason, 4000);
					setSubmitting(false);
					return;
				}

				if (!result.canPrecompose) {
					if (
						result.reason?.includes('already in use') ||
						result.reason?.includes('already exists')
					) {
						setServerError(result.reason);
						setSubmitting(false);
						return;
					}

					setSelectedModal({
						type: 'precompose-refactor',
						targets: state.targets,
					});
					return;
				}

				setSelectedModal(null);
				if (result.newCompositionId !== null) {
					selectCompositionWhenReady(result.newCompositionId);
				}
			})
			.catch((error) => {
				showNotification((error as Error).message, 4000);
				setSubmitting(false);
			});
	}, [newCompositionId, setSelectedModal, state, submitting, valid]);

	const onSubmit: React.FormEventHandler<HTMLFormElement> = useCallback(
		(event) => {
			event.preventDefault();
			onPrecompose();
		},
		[onPrecompose],
	);

	return (
		<DismissableModal>
			<ModalHeader title="Pre-compose" />
			<form onSubmit={onSubmit}>
				<div style={content}>
					<div style={optionRow}>
						<div style={label}>Composition ID</div>
						<div style={rightRow}>
							<div>
								<RemotionInput
									value={newCompositionId}
									onChange={(event) => {
										setNewCompositionId(event.target.value);
										setServerError(null);
									}}
									type="text"
									autoFocus
									placeholder="Composition ID"
									status={validationMessage ? 'error' : 'ok'}
									rightAlign
								/>
								{validationMessage ? (
									<ValidationMessage
										align="flex-start"
										message={validationMessage}
										type="error"
									/>
								) : null}
							</div>
						</div>
					</div>
				</div>
				<ModalFooterContainer>
					<Row align="center" justify="flex-end">
						<Button onClick={() => setSelectedModal(null)}>Cancel</Button>
						<Spacing x={1} />
						<Button onClick={onPrecompose} disabled={!valid || submitting}>
							Pre-compose
						</Button>
					</Row>
				</ModalFooterContainer>
			</form>
		</DismissableModal>
	);
};
