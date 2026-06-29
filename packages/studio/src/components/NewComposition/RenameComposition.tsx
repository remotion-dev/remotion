import type {ChangeEventHandler} from 'react';
import React, {
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';
import {Internals} from 'remotion';
import {useRenameComposition} from '../../helpers/use-rename-composition';
import {Spacing} from '../layout';
import {ModalFooterContainer} from '../ModalFooter';
import {ModalHeader} from '../ModalHeader';
import {label, optionRow, rightRow} from '../RenderModal/layout';
import {
	ResolveCompositionBeforeModal,
	ResolvedCompositionContext,
} from '../RenderModal/ResolveCompositionBeforeModal';
import {CodemodFooter} from './CodemodFooter';
import {DismissableModal} from './DismissableModal';
import {InputAndValidationContainer} from './InputAndValidationContainer';
import {RemotionInput} from './RemInput';
import {ValidationMessage} from './ValidationMessage';

const content: React.CSSProperties = {
	padding: 12,
	paddingRight: 12,
	flex: 1,
	fontSize: 13,
	minWidth: 500,
};

const RenameCompositionLoaded: React.FC<{}> = () => {
	const context = useContext(ResolvedCompositionContext);
	if (!context) {
		throw new Error('Resolved composition context');
	}

	const {resolved, unresolved} = context;
	const compositionStack = unresolved.stack ?? null;

	const {compositions} = useContext(Internals.CompositionManager);
	const [newId, setName] = useState(() => {
		return resolved.result.id;
	});
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const input = inputRef.current;
		if (!input) return;
		input.select();
	}, []);

	const onNameChange: ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			setName(e.target.value);
		},
		[],
	);

	const {
		codemod,
		renameComposition,
		valid,
		validationMessage: compNameErrMessage,
	} = useRenameComposition({
		compositions,
		currentId: resolved.result.id,
		newId,
	});

	const onSubmit: React.FormEventHandler<HTMLFormElement> = useCallback((e) => {
		e.preventDefault();
	}, []);

	return (
		<>
			<ModalHeader title={`Rename ${resolved.result.id}`} />
			<form onSubmit={onSubmit}>
				<div style={content}>
					<div style={optionRow}>
						<div style={label}>ID</div>
						<div style={rightRow}>
							<InputAndValidationContainer>
								<RemotionInput
									ref={inputRef}
									value={newId}
									onChange={onNameChange}
									type="text"
									autoFocus
									placeholder="Composition ID"
									status="ok"
									rightAlign
								/>
								{compNameErrMessage ? (
									<>
										<Spacing y={1} block />
										<ValidationMessage
											align="flex-start"
											message={compNameErrMessage}
											type="error"
										/>
									</>
								) : null}
							</InputAndValidationContainer>
						</div>
					</div>
				</div>
				<ModalFooterContainer>
					<CodemodFooter
						loadingNotification={'Renaming...'}
						errorNotification={'Could not rename composition'}
						successNotification={`Renamed to ${newId}`}
						genericSubmitLabel={'Rename'}
						submitLabel={({relativeRootPath}) => `Modify ${relativeRootPath}`}
						codemod={codemod}
						stack={compositionStack}
						valid={valid}
						onSuccess={null}
						applyCodemod={({signal, symbolicatedStack}) =>
							renameComposition({
								newCompositionId: newId,
								signal,
								symbolicatedStack,
							})
						}
					/>
				</ModalFooterContainer>
			</form>
		</>
	);
};

export const RenameComposition: React.FC<{
	readonly compositionId: string;
}> = ({compositionId}) => {
	return (
		<DismissableModal>
			<ResolveCompositionBeforeModal compositionId={compositionId}>
				<RenameCompositionLoaded />
			</ResolveCompositionBeforeModal>
		</DismissableModal>
	);
};
