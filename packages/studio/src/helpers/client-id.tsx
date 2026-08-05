import {
	getConfigFileChangeMessage,
	type EventSourceEvent,
} from '@remotion/studio-shared';
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
	configFileChangeRevision: number;
	subscribeToEvent: (
		type: EventSourceEvent['type'],
		listener: (event: EventSourceEvent) => void,
	) => () => void;
};

export const StudioServerConnectionCtx = React.createContext<Context>({
	previewServerState: {
		type: 'init',
	},
	configFileChangeRevision: 0,
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
}> = ({children}) => {
	const listeners = useRef<Listeners>([]);
	const latestUndoRedoEvent = useRef<
		Extract<EventSourceEvent, {type: 'undo-redo-stack-changed'}> | undefined
	>(undefined);

	const subscribeToEvent = useCallback(
		(
			type: EventSourceEvent['type'],
			listener: (event: EventSourceEvent) => void,
		) => {
			listeners.current.push({type, listener});
			if (type === 'undo-redo-stack-changed' && latestUndoRedoEvent.current) {
				listener(latestUndoRedoEvent.current);
			}

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
	const [configFileChangeRevision, setConfigFileChangeRevision] =
		React.useState(0);

	useEffect(() => {
		const handleEvent = (newEvent: EventSourceEvent) => {
			if (
				newEvent.type === 'new-input-props' ||
				newEvent.type === 'new-env-variables'
			) {
				reloadUrl();
			}

			if (newEvent.type === 'config-file-changed') {
				window.remotion_renderDefaults = newEvent.renderDefaults;
				window.remotion_studioConfig = newEvent.studioRuntimeConfig;
				window.remotion_editorName = newEvent.editorName;
				setConfigFileChangeRevision((revision) => revision + 1);
				showNotification(getConfigFileChangeMessage(newEvent.changeType), 4000);
			}

			if (newEvent.type === 'config-file-reload-failed') {
				showNotification(newEvent.errorMessage, 4000);
			}

			if (newEvent.type === 'init') {
				latestUndoRedoEvent.current = {
					type: 'undo-redo-stack-changed',
					undoFile: newEvent.undoFile,
					redoFile: newEvent.redoFile,
				};
				listeners.current.forEach((l) => {
					if (l.type === 'undo-redo-stack-changed') {
						l.listener(latestUndoRedoEvent.current!);
					}
				});
			}

			if (newEvent.type === 'undo-redo-stack-changed') {
				latestUndoRedoEvent.current = newEvent;
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
	}, []);

	const context: Context = useMemo(() => {
		return {
			previewServerState: state,
			configFileChangeRevision,
			subscribeToEvent,
		};
	}, [configFileChangeRevision, state, subscribeToEvent]);

	return (
		<StudioServerConnectionCtx.Provider value={context}>
			{children}
		</StudioServerConnectionCtx.Provider>
	);
};

export const useStudioConfigRevision = () => {
	return React.useContext(StudioServerConnectionCtx).configFileChangeRevision;
};
