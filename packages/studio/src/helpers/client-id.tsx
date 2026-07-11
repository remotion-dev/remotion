import type {EventSourceEvent} from '@remotion/studio-shared';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import type {WatchRemotionStaticFilesPayload} from 'remotion';
import {Internals} from 'remotion';
import {showNotification} from '../components/Notifications/NotificationCenter';
import playBeepSound from '../components/PlayBeepSound';
import {renderJobsRef} from '../components/RenderQueue/context';
import {
	subscribeToPreviewServerConnectionState,
	subscribeToPreviewServerEvents,
	type PreviewServerConnectionState,
} from './preview-server-events';
import {reloadUrl} from './url-state';

type Context = {
	previewServerState: PreviewServerConnectionState;
	subscribeToEvent: (
		type: EventSourceEvent['type'],
		listener: (event: EventSourceEvent) => void,
	) => () => void;
};

export const StudioServerConnectionCtx = React.createContext<Context>({
	previewServerState: {
		type: 'init',
	},
	subscribeToEvent: () => {
		throw new Error('Context not initalized');
	},
});

type Listeners = {
	type: string;
	listener: (event: EventSourceEvent) => void;
}[];

export const PreviewServerConnection: React.FC<{
	readonly children: React.ReactNode;
	readonly readOnlyStudio: boolean;
}> = ({children, readOnlyStudio}) => {
	const listeners = useRef<Listeners>([]);

	const subscribeToEvent = useCallback(
		(
			type: EventSourceEvent['type'],
			listener: (event: EventSourceEvent) => void,
		) => {
			listeners.current.push({type, listener});

			return () => {
				listeners.current = listeners.current.filter(
					(l) => l.type !== type || l.listener !== listener,
				);
			};
		},
		[],
	);

	const [state, setState] = React.useState<PreviewServerConnectionState>({
		type: 'init',
	});

	useEffect(() => {
		if (readOnlyStudio) {
			return;
		}

		const handleEvent = (newEvent: EventSourceEvent) => {
			if (
				newEvent.type === 'new-input-props' ||
				newEvent.type === 'new-env-variables' ||
				newEvent.type === 'config-file-changed'
			) {
				reloadUrl();
			}

			if (newEvent.type === 'init') {
				listeners.current.forEach((l) => {
					if (l.type === 'undo-redo-stack-changed') {
						l.listener({
							type: 'undo-redo-stack-changed',
							undoFile: newEvent.undoFile,
							redoFile: newEvent.redoFile,
						});
					}
				});
			}

			if (newEvent.type === 'render-queue-updated') {
				renderJobsRef.current?.updateRenderJobs(newEvent.queue);
				for (const job of newEvent.queue) {
					if (job.status === 'done' && job.beepOnFinish) {
						playBeepSound(job.id);
					}
				}
			}

			if (newEvent.type === 'client-renders-updated') {
				renderJobsRef.current?.updateClientRenders(newEvent.renders);
			}

			if (newEvent.type === 'render-job-failed') {
				showNotification(`Rendering "${newEvent.compositionId}" failed`, 2000);
			}

			if (newEvent.type === 'new-public-folder') {
				const payload: WatchRemotionStaticFilesPayload = {
					files: newEvent.files,
				};

				window.remotion_staticFiles = newEvent.files;
				window.remotion_publicFolderExists = newEvent.folderExists;

				window.dispatchEvent(
					new CustomEvent(Internals.WATCH_REMOTION_STATIC_FILES, {
						detail: payload,
					}),
				);
			}

			listeners.current.forEach((l) => {
				if (l.type === newEvent.type) {
					l.listener(newEvent);
				}
			});
		};

		const unsubscribeFromEvents = subscribeToPreviewServerEvents(handleEvent);
		const unsubscribeFromConnectionState =
			subscribeToPreviewServerConnectionState(setState);

		return () => {
			unsubscribeFromEvents();
			unsubscribeFromConnectionState();
		};
	}, [readOnlyStudio]);

	const context: Context = useMemo(() => {
		return {
			previewServerState: state,
			subscribeToEvent,
		};
	}, [state, subscribeToEvent]);

	return (
		<StudioServerConnectionCtx.Provider value={context}>
			{children}
		</StudioServerConnectionCtx.Provider>
	);
};
