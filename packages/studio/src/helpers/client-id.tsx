import type {EventSourceEvent} from '@remotion/studio-shared';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
import type {WatchRemotionStaticFilesPayload} from 'remotion';
import {Internals} from 'remotion';
import {showNotification} from '../components/Notifications/NotificationCenter';
import playBeepSound from '../components/PlayBeepSound';
import {renderJobsRef} from '../components/RenderQueue/context';
import {reloadUrl} from './url-state';

type PreviewServerState =
	| {
			type: 'init';
	  }
	| {
			type: 'connected';
			clientId: string;
	  }
	| {
			type: 'disconnected';
	  };

type Context = {
	previewServerState: PreviewServerState;
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

	const openEventSource = useCallback(() => {
		const source = new EventSource('/events');

		source.addEventListener('message', (event) => {
			const newEvent = JSON.parse(event.data) as EventSourceEvent;
			if (
				newEvent.type === 'new-input-props' ||
				newEvent.type === 'new-env-variables'
			) {
				reloadUrl();
			}

			if (newEvent.type === 'init') {
				setState({
					type: 'connected',
					clientId: newEvent.clientId,
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
		});

		source.addEventListener('open', () => {
			(source as EventSource).addEventListener(
				'error',
				() => {
					setState({type: 'disconnected'});
					// Display an error message that the studio server has disconnected.
					source?.close();

					// Retry later
					setTimeout(() => {
						openEventSource();
					}, 1000);
				},
				{once: true},
			);
		});

		const close = () => {
			source.close();
		};

		return {
			close,
		};
	}, []);

	useEffect(() => {
		if (readOnlyStudio) {
			return;
		}

		const {close} = openEventSource();

		return () => {
			close();
		};
	}, [openEventSource, readOnlyStudio]);

	const [state, setState] = React.useState<PreviewServerState>({
		type: 'init',
	});

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
