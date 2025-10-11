import React, {useCallback, useContext} from 'react';
import {makeRetryPayload} from '../../helpers/retry-payload';
import {ModalsContext} from '../../state/modals';
import {Button} from '../Button';
import {HORIZONTAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {ModalContainer} from '../ModalContainer';
import {ModalHeader} from '../ModalHeader';
import {showNotification} from '../Notifications/NotificationCenter';
import {cancelRenderJob, removeRenderJob} from '../RenderQueue/actions';
import {RenderQueueContext} from '../RenderQueue/context';
import {Flex, SPACING_UNIT} from '../layout';
import {GuiRenderStatus} from './GuiRenderStatus';

const container: React.CSSProperties = {
	padding: 20,
	maxWidth: 900,
	paddingTop: 0,
};

const codeBlock: React.CSSProperties = {
	backgroundColor: '#222',
	whiteSpace: 'pre',
	padding: 12,
	borderRadius: 4,
	fontFamily: 'monospace',
	overflow: 'auto',
	maxHeight: 300,
};

const spacer: React.CSSProperties = {
	height: SPACING_UNIT,
	width: SPACING_UNIT,
};

const buttonRow: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	justifyContent: 'flex-end',
};

export const RenderStatusModal: React.FC<{readonly jobId: string}> = ({
	jobId,
}) => {
	const {setSelectedModal} = useContext(ModalsContext);
	const {jobs} = useContext(RenderQueueContext);
	const job = jobs.find((j) => j.id === jobId);
	if (!job) {
		throw new Error('job not found');
	}

	const onQuit = useCallback(() => {
		setSelectedModal(null);
	}, [setSelectedModal]);

	const onRetry = useCallback(() => {
		const retryPayload = makeRetryPayload(job);
		setSelectedModal(retryPayload);
	}, [job, setSelectedModal]);

	const onClickOnRemove = useCallback(() => {
		setSelectedModal(null);
		removeRenderJob(job).catch((err) => {
			showNotification(`Could not remove job: ${err.message}`, 2000);
		});
	}, [job, setSelectedModal]);

	const onClickOnCancel = useCallback(() => {
		cancelRenderJob(job).catch((err) => {
			showNotification(`Could not cancel job: ${err.message}`, 2000);
		});
	}, [job]);

	if (!job || job.status === 'idle') {
		throw new Error('should not have rendered this modal');
	}

	return (
		<ModalContainer onOutsideClick={onQuit} onEscape={onQuit}>
			<ModalHeader title={`Render ${job.compositionId}`} />
			<div style={container}>
				{job.status === 'failed' ? (
					<>
						<p>The render failed because of the following error:</p>
						<div className={HORIZONTAL_SCROLLBAR_CLASSNAME} style={codeBlock}>
							{job.error.stack}
						</div>
					</>
				) : null}
				{job.status === 'done' || job.status === 'running' ? (
					<GuiRenderStatus job={job} />
				) : null}
				<div style={spacer} />
				<div style={buttonRow}>
					{job.status === 'running' ? (
						<Button onClick={onClickOnCancel}>Cancel render</Button>
					) : (
						<Button onClick={onClickOnRemove}>Remove render</Button>
					)}
					<Flex />
					{job.status === 'failed' ? (
						<Button onClick={onRetry}>Retry</Button>
					) : null}
					<div style={spacer} />
					<Button onClick={onQuit}>Close</Button>
				</div>
			</div>
		</ModalContainer>
	);
};
