import {useCallback, useContext} from 'react';
import {useSyncExternalStore} from '../../helpers/use-sync-external-store';
import {RenderQueueActionsContext} from './context';

export const useIsRenderJobCancelling = (jobId: string) => {
	const {isCancelling, subscribeToCancellation} = useContext(
		RenderQueueActionsContext,
	);
	const subscribe = useCallback(
		(listener: () => void) => subscribeToCancellation(jobId, listener),
		[jobId, subscribeToCancellation],
	);
	const getSnapshot = useCallback(
		() => isCancelling(jobId),
		[isCancelling, jobId],
	);
	return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};
