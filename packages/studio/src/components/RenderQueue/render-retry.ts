import {useContext, useMemo, useRef} from 'react';
import {Internals} from 'remotion';
import {getBrowserStudioOperations} from '../../helpers/browser-studio-operations';
import {StudioServerConnectionCtx} from '../../helpers/client-id';
import {
	makeClientRetryPayload,
	makeRetryPayload,
} from '../../helpers/retry-payload';
import {
	SetSelectedModalContext,
	type SetSelectedModalContextType,
} from '../../state/modals';
import {showNotification} from '../Notifications/NotificationCenter';
import {isRestoredClientJob} from './client-side-render-types';
import {
	isClientRenderJob,
	RenderQueueActionsContext,
	type AnyRenderJob,
} from './context';

type RenderRetryFailure = {
	status: 'not-found' | 'not-retryable' | 'unavailable' | 'error';
	reason: string;
};

export type RenderRetryResult =
	| RenderRetryFailure
	| {
			status: 'opened';
			renderMode: 'server' | 'browser';
			outputName: string;
	  };

export const createRenderRetryActions = ({
	getJobs,
	hasComposition,
	canOpenServerSettings,
	setSelectedModal,
}: {
	getJobs: () => readonly AnyRenderJob[];
	hasComposition: (compositionId: string) => boolean;
	canOpenServerSettings: () => boolean;
	setSelectedModal: SetSelectedModalContextType['setSelectedModal'];
}) => {
	const unavailable = (
		job: AnyRenderJob | undefined,
	): RenderRetryFailure | null => {
		if (!job)
			return {
				status: 'not-found',
				reason: 'The render job is no longer available.',
			};
		if (
			job.status !== 'done' &&
			job.status !== 'failed' &&
			job.status !== 'cancelled'
		) {
			return {
				status: 'not-retryable',
				reason: 'Wait for this render to finish before reopening its settings.',
			};
		}

		if (isClientRenderJob(job) && isRestoredClientJob(job)) {
			return {
				status: 'unavailable',
				reason:
					'The original settings for this restored browser render are unavailable.',
			};
		}

		if (!hasComposition(job.compositionId)) {
			return {
				status: 'unavailable',
				reason: `Composition ${job.compositionId} is no longer available.`,
			};
		}

		if (!isClientRenderJob(job) && !canOpenServerSettings()) {
			return {
				status: 'unavailable',
				reason:
					'Reconnect to the Studio server to reopen this render’s settings.',
			};
		}

		return null;
	};

	return {
		getRetryState: (jobId: string) => {
			const result = unavailable(getJobs().find((job) => job.id === jobId));
			return {canRetry: result === null, reason: result?.reason ?? null};
		},
		openRenderJobSettings: (jobId: string): RenderRetryResult => {
			const job = getJobs().find((candidate) => candidate.id === jobId);
			const failure = unavailable(job);
			if (failure) {
				showNotification(failure.reason, 4000);
				return failure;
			}

			if (!job) throw new Error('Expected an available render job');
			try {
				if (isClientRenderJob(job)) {
					if (isRestoredClientJob(job))
						throw new Error('The original render settings are unavailable.');
					setSelectedModal(makeClientRetryPayload(job));
				} else {
					setSelectedModal(makeRetryPayload(job));
				}

				return {
					status: 'opened',
					renderMode: isClientRenderJob(job) ? 'browser' : 'server',
					outputName: job.outName,
				};
			} catch (error) {
				const reason = error instanceof Error ? error.message : String(error);
				showNotification(`Could not reopen render settings: ${reason}`, 4000);
				return {status: 'error', reason};
			}
		},
	};
};

export const useRenderJobRetry = () => {
	const {getJobs} = useContext(RenderQueueActionsContext);
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const compositions = useContext(Internals.CompositionManagerRefContext);
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const connectionRef = useRef(previewServerState);
	connectionRef.current = previewServerState;
	return useMemo(
		() =>
			createRenderRetryActions({
				getJobs,
				hasComposition: (id) =>
					compositions.current.compositions.some(
						(composition) => composition.id === id,
					),
				canOpenServerSettings: () =>
					connectionRef.current.type === 'connected' &&
					!window.remotion_isReadOnlyStudio &&
					getBrowserStudioOperations() === null,
				setSelectedModal,
			}),
		[compositions, getJobs, setSelectedModal],
	);
};
