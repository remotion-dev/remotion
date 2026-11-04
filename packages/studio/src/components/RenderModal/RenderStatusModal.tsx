import type {RenderJob} from '@remotion/studio-shared';
import React, {useCallback, useContext} from 'react';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {RENDER_STATUS_BACKGROUND} from '../../helpers/colors';
import {SetSelectedModalContext} from '../../state/modals';
import {ActionTooltip} from '../ActionTooltip';
import {Button} from '../Button';
import {Flex, SPACING_UNIT} from '../layout';
import {HORIZONTAL_SCROLLBAR_CLASSNAME} from '../Menu/is-menu-item';
import {ModalContainer} from '../ModalContainer';
import {ModalHeader} from '../ModalHeader';
import {showNotification} from '../Notifications/NotificationCenter';
import {removeRenderJob} from '../RenderQueue/actions';
import {
	RenderQueueActionsContext,
	isClientRenderJob,
	RenderQueueContext,
} from '../RenderQueue/context';
import {useRenderJobRetry} from '../RenderQueue/render-retry';
import {useIsRenderJobCancelling} from '../RenderQueue/use-is-render-job-cancelling';
import {ClientRenderProgress} from './ClientRenderProgress';
import {GuiRenderStatus} from './GuiRenderStatus';

const container: React.CSSProperties = {
	padding: 20,
	maxWidth: 900,
	paddingTop: 0,
};

const codeBlock: React.CSSProperties = {
	backgroundColor: RENDER_STATUS_BACKGROUND,
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
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const {jobs, removeClientJob} = useContext(RenderQueueContext);
	const {cancelJob, canCancelJob} = useContext(RenderQueueActionsContext);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const cancelling = useIsRenderJobCancelling(jobId);
	const {getRetryState, openRenderJobSettings} = useRenderJobRetry();
	const retryState = getRetryState(jobId);

	const job = jobs.find((j) => j.id === jobId);
	if (!job) {
		throw new Error('job not found');
	}

	const isClientJob = isClientRenderJob(job);

	const onQuit = useCallback(() => {
		setSelectedModal(null);
	}, [setSelectedModal]);

	const onRetry = useCallback(() => {
		openRenderJobSettings(jobId);
	}, [jobId, openRenderJobSettings]);

	const onClickOnRemove = useCallback(() => {
		setSelectedModal(null);
		if (isClientJob) {
			removeClientJob(job.id);
		} else {
			removeRenderJob(job).catch((err) => {
				showNotification(`Could not remove job: ${err.message}`, 2000);
			});
		}
	}, [job, isClientJob, removeClientJob, setSelectedModal]);

	const onClickOnCancel = useCallback(() => {
		cancelJob(jobId);
	}, [cancelJob, jobId]);

	const errorDetails =
		job.status === 'failed'
			? job.error.stack?.split('\n')[0].includes(job.error.message)
				? job.error.stack
				: [job.error.message, job.error.stack].filter(Boolean).join('\n')
			: null;

	return (
		<ModalContainer onOutsideClick={onQuit} onEscape={onQuit}>
			<ModalHeader title={`Render ${job.compositionId}`} />
			<div style={container}>
				{job.status === 'cancelled' ? (
					<p role="status" style={{fontSize: 14}}>
						Render cancelled.
					</p>
				) : job.status === 'idle' ? (
					<p role="status" style={{fontSize: 14}}>
						Queued for rendering.
					</p>
				) : null}
				{job.status === 'failed' ? (
					<>
						<p>The render failed because of the following error:</p>
						<div className={HORIZONTAL_SCROLLBAR_CLASSNAME} style={codeBlock}>
							{errorDetails}
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
					{job.status === 'running' || job.status === 'idle' ? (
						<Button
							onClick={onClickOnCancel}
							disabled={
								cancelling ||
								!canCancelJob(jobId) ||
								(!isClientJob && previewServerState.type !== 'connected')
							}
						>
							{cancelling ? 'Cancelling…' : 'Cancel render'}
						</Button>
					) : (
						<Button onClick={onClickOnRemove}>Remove render</Button>
					)}
					<Flex />
					{job.status === 'done' ||
					job.status === 'failed' ||
					job.status === 'cancelled' ? (
						<ActionTooltip
							label={retryState.reason ?? 'Reopen render settings'}
							shortcut={null}
							delay={800}
							dismissOnClick
						>
							<Button onClick={onRetry} disabled={!retryState.canRetry}>
								Retry
							</Button>
						</ActionTooltip>
					) : null}
					<div style={spacer} />
					<Button onClick={onQuit}>Close</Button>
				</div>
			</div>
		</ModalContainer>
	);
};
