import type {ChangeEventHandler} from 'react';
import React, {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {Internals} from 'remotion';
import {subscribeToPreviewServerEvents} from '../helpers/preview-server-events';
import {getNewCompositionNaming} from '../helpers/use-create-composition';
import {useKeybinding} from '../helpers/use-keybinding';
import type {ModalState} from '../state/modals';
import {SetSelectedModalContext} from '../state/modals';
import {selectCompositionWhenReady} from './InitialCompositionLoader';
import {ModalFooterContainer} from './ModalFooter';
import {ModalHeader} from './ModalHeader';
import {CompositionEditFooterPresentation} from './NewComposition/CompositionEditFooter';
import {CompositionIdField} from './NewComposition/CompositionIdField';
import {DismissableModal} from './NewComposition/DismissableModal';
import {showNotification} from './Notifications/NotificationCenter';
import {precomposeJsxNodes} from './precompose-jsx-nodes-api';

const content: React.CSSProperties = {
	padding: 12,
	paddingRight: 12,
	flex: 1,
	fontSize: 13,
	minWidth: 500,
};

type State = Extract<ModalState, {type: 'precompose-name'}>;

const PrecomposeNameModalLoaded: React.FC<{readonly state: State}> = ({
	state,
}) => {
	const {compositions} = useContext(Internals.CompositionManager);
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const [input, setInput] = useState(state.suggestedCompositionId);
	const [submitting, setSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const submittingRef = useRef(false);

	useEffect(() => {
		inputRef.current?.select();
	}, []);

	useEffect(() => {
		const fileNames = new Set(state.request.nodes.map((n) => n.fileName));
		return subscribeToPreviewServerEvents((event) => {
			if (submittingRef.current) {
				return;
			}

			if (
				(event.type === 'hmr' && event.hmrEvent.action === 'building') ||
				(event.type === 'sequence-node-paths-remapped' &&
					event.mutation.files.some(({absolutePath}) =>
						fileNames.has(absolutePath),
					))
			) {
				setSelectedModal(null);
				showNotification(
					'The source changed. Select the sequences and pre-compose again.',
					4000,
				);
			}
		});
	}, [setSelectedModal, state.request.nodes]);

	const {compositionId, componentName, validationMessage} = useMemo(
		() => getNewCompositionNaming(input, compositions),
		[compositions, input],
	);

	const onNameChange: ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			setInput(e.target.value);
			setSubmitError(null);
		},
		[],
	);

	const disabled = validationMessage !== null || submitting;

	const trigger = useCallback(() => {
		setSubmitting(true);
		submittingRef.current = true;
		let succeeded = false;
		precomposeJsxNodes({
			...state.request,
			name: {compositionId, componentName},
			dryRun: false,
		})
			.then((result) => {
				if (!result.success) {
					showNotification(`Could not pre-compose: ${result.reason}`, 4000);
					return;
				}

				if (!result.canPrecompose) {
					if (result.invalidName) {
						setSubmitError(result.reason);
						return;
					}

					setSelectedModal({
						type: 'precompose-refactor',
						targets: state.refactorTargets,
					});
					return;
				}

				succeeded = true;
				setSelectedModal(null);
				if (result.newCompositionId !== null) {
					selectCompositionWhenReady(result.newCompositionId);
				}
			})
			.catch((err) => {
				showNotification(
					`Could not pre-compose: ${(err as Error).message}`,
					4000,
				);
			})
			.finally(() => {
				submittingRef.current = succeeded;
				setSubmitting(false);
			});
	}, [
		componentName,
		compositionId,
		setSelectedModal,
		state.refactorTargets,
		state.request,
	]);

	const {registerKeybinding} = useKeybinding();

	useEffect(() => {
		if (disabled) {
			return;
		}

		const enter = registerKeybinding({
			callback() {
				trigger();
			},
			commandCtrlKey: false,
			key: 'Enter',
			event: 'keydown',
			preventDefault: true,
			triggerIfInputFieldFocused: true,
			keepRegisteredWhenNotHighestContext: false,
		});
		return () => {
			enter.unregister();
		};
	}, [disabled, registerKeybinding, trigger]);

	const onSubmit: React.FormEventHandler<HTMLFormElement> = useCallback((e) => {
		e.preventDefault();
	}, []);

	return (
		<>
			<ModalHeader title="Pre-compose" />
			<form onSubmit={onSubmit}>
				<div style={content}>
					<CompositionIdField
						compositionId={compositionId}
						inputRef={inputRef}
						onChange={onNameChange}
						validationMessage={validationMessage ?? submitError}
						value={input}
					/>
				</div>
				<ModalFooterContainer>
					<CompositionEditFooterPresentation
						disabled={disabled}
						genericSubmitLabel="Pre-compose"
						relativeFilePath={null}
						submitLabel={() => 'Pre-compose'}
						trigger={trigger}
					/>
				</ModalFooterContainer>
			</form>
		</>
	);
};

export const PrecomposeNameModal: React.FC<{readonly state: State}> = ({
	state,
}) => {
	return (
		<DismissableModal>
			<PrecomposeNameModalLoaded state={state} />
		</DismissableModal>
	);
};
