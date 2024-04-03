import type {RecastCodemod} from '@remotion/studio-shared';
import type {ChangeEventHandler} from 'react';
import React, {useCallback, useContext, useMemo, useState} from 'react';
import {Internals} from 'remotion';
import {validateCompositionName} from '../../helpers/validate-new-comp-data';
import {Spacing} from '../layout';
import {NewCompHeader} from '../ModalHeader';
import {label, optionRow, rightRow} from '../RenderModal/layout';
import {
	ResolveCompositionBeforeModal,
	ResolvedCompositionContext,
} from '../RenderModal/ResolveCompositionBeforeModal';
import {CodemodFooter} from './CodemodFooter';
import {DismissableModal} from './DismissableModal';
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

	const {resolved} = context;

	const {compositions} = useContext(Internals.CompositionManager);
	const [newId, setName] = useState(() => {
		return resolved.result.id;
	});

	const onNameChange: ChangeEventHandler<HTMLInputElement> = useCallback(
		(e) => {
			setName(e.target.value);
		},
		[],
	);

	const compNameErrMessage =
		newId === resolved.result.id
			? null
			: validateCompositionName(newId, compositions);

	const valid = compNameErrMessage === null && resolved.result.id !== newId;

	const codemod: RecastCodemod = useMemo(() => {
		return {
			type: 'rename-composition',
			idToRename: resolved.result.id,
			newId,
		};
	}, [newId, resolved.result.id]);

	return (
		<>
			<NewCompHeader title={`Rename ${resolved.result.id}`} />
			<form>
				<div style={content}>
					<div style={optionRow}>
						<div style={label}>ID</div>
						<div style={rightRow}>
							<div>
								<RemotionInput
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
							</div>
						</div>
					</div>
				</div>
				<div style={{...content, borderTop: '1px solid black'}}>
					<CodemodFooter
						loadingNotification={'Renaming...'}
						errorNotification={'Could not rename composition'}
						succeessNotifcation={`Renamed to ${newId}`}
						genericSubmitLabel={'Rename'}
						submitLabel={({relativeRootPath}) => `Modify ${relativeRootPath}`}
						codemod={codemod}
						valid={valid}
					/>
				</div>
			</form>
		</>
	);
};

export const RenameComposition: React.FC<{
	compositionId: string;
}> = ({compositionId}) => {
	return (
		<DismissableModal>
			<ResolveCompositionBeforeModal compositionId={compositionId}>
				<RenameCompositionLoaded />
			</ResolveCompositionBeforeModal>
		</DismissableModal>
	);
};
