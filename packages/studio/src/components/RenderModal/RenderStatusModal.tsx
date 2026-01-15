import type {RenderJob} from '@remotion/studio-shared';
import React, {useCallback, useContext} from 'react';
import {
	makeClientRetryPayload,
	makeRetryPayload,
} from '../../helpers/retry-payload';
import {ModalsContext} from '../../state/modals';
import {Button} from '../Button';
import {HORIZONTAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {ModalContainer} from '../ModalContainer';
import {ModalHeader} from '../ModalHeader';
import {showNotification} from '../Notifications/NotificationCenter';
import {cancelRenderJob, removeRenderJob} from '../RenderQueue/actions';
import {isClientRenderJob, RenderQueueContext} from '../RenderQueue/context';
import {Flex, SPACING_UNIT} from '../layout';
import {ClientRenderProgress} from './ClientRenderProgress';
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
	const {jobs, removeClientJob, cancelClientJob} =
		useContext(RenderQueueContext);

	const job = jobs.find((j) => j.id === jobId);
	if (!job) {
		throw new Error('job not found');
	}

	const isClientJob = isClientRenderJob(job);

	const onQuit = useCallback(() => {
		setSelectedModal(null);
	}, [setSelectedModal]);

	const onRetry = useCallback(() => {
		if (isClientJob) {
			const retryPayload = makeClientRetryPayload(job);
			setSelectedModal(retryPayload);
		} else {
			const retryPayload = makeRetryPayload(job);
			setSelectedModal(retryPayload);
		}
	}, [job, isClientJob, setSelectedModal]);

	const onClickOnRemove = useCallback(() => {
		setSelectedModal(null);
		if (isClientJob) {
			removeClientJob(job.id);
			showNotification('Removed render', 2000);
		} else {
			removeRenderJob(job).catch((err) => {
				showNotification(`Could not remove job: ${err.message}`, 2000);
			});
		}
	}, [job, isClientJob, removeClientJob, setSelectedModal]);

	const onClickOnCancel = useCallback(() => {
		if (isClientJob) {
			cancelClientJob(job.id);
		} else {
			cancelRenderJob(job).catch((err) => {
				showNotification(`Could not cancel job: ${err.message}`, 2000);
			});
		}
	}, [job, isClientJob, cancelClientJob]);

	if (job.status === 'idle') {
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
				{(job.status === 'done' || job.status === 'running') &&
					(isClientJob ? (
						<ClientRenderProgress job={job} />
					) : (
						<GuiRenderStatus job={job as RenderJob} />
					))}
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
