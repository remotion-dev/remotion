import React, {useCallback, useContext} from 'react';
import {ModalsContext} from '../../state/modals';
import {Spacing} from '../layout';
import {ModalContainer} from '../ModalContainer';
import {NewCompHeader} from '../ModalHeader';
import {RenderQueueContext} from '../RenderQueue/context';

const container: React.CSSProperties = {
	padding: 20,
	maxWidth: 1200,
};

export const RenderProgressModal: React.FC<{jobId: string}> = ({jobId}) => {
	const {setSelectedModal} = useContext(ModalsContext);
	const {jobs} = useContext(RenderQueueContext);

	const onQuit = useCallback(() => {
		setSelectedModal(null);
	}, [setSelectedModal]);

	const job = jobs.find((j) => j.id === jobId);

	// TODO: What if the job fails while the modal is open? Merge together?
	if (!job || job.status === 'idle' || job.status === 'failed') {
		throw new Error('should not have rendered this modal');
	}

	return (
		<ModalContainer onOutsideClick={onQuit} onEscape={onQuit}>
			<NewCompHeader title={`Render ${job.compositionId}`} />
			<div style={container}>
				<Spacing />
				{JSON.stringify(job.progress, null, 2)}
			</div>
		</ModalContainer>
	);
};
