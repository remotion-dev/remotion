import type {EventSourceEvent} from '@remotion/studio-shared';
import {useContext, useEffect, useState} from 'react';
import {
	subscribeToFileExistenceWatcher,
	unsubscribeFromFileExistenceWatcher,
} from '../components/RenderQueue/actions';
import {StudioServerConnectionCtx} from './client-id';
import {getRenderOutputSrc} from './get-asset-metadata';

const requestsByClient = new Map<
	string,
	{pending: Promise<void>; activeEffects: number}
>();

export const useFileExistence = (outName: string) => {
	const {previewServerState: state, subscribeToEvent} = useContext(
		StudioServerConnectionCtx,
	);
	const clientId = state.type === 'connected' ? state.clientId : null;
	const [result, setResult] = useState<{
		outName: string;
		clientId: string | null;
		exists: boolean;
		checkFailed: boolean;
		canOpenInFileExplorer: boolean;
	}>({
		outName,
		clientId,
		exists: false,
		checkFailed: false,
		canOpenInFileExplorer: false,
	});
	useEffect(() => {
		setResult({
			outName,
			clientId,
			exists: false,
			checkFailed: false,
			canOpenInFileExplorer: false,
		});
		if (clientId === null) {
			return;
		}

		const requests = requestsByClient.get(clientId) ?? {
			pending: Promise.resolve(),
			activeEffects: 0,
		};
		requestsByClient.set(clientId, requests);
		requests.activeEffects++;

		let active = true;
		let subscribed = false;
		let receivedFileEvent = false;
		const controller = new AbortController();
		const listener = (event: EventSourceEvent) => {
			if (
				!active ||
				(event.type !== 'watched-file-deleted' &&
					event.type !== 'watched-file-undeleted') ||
				event.file !== outName
			) {
				return;
			}

			receivedFileEvent = true;
			setResult({
				outName,
				clientId,
				exists: event.type === 'watched-file-undeleted',
				checkFailed: false,
				canOpenInFileExplorer: true,
			});
		};

		const unsubscribeDeleted = subscribeToEvent(
			'watched-file-deleted',
			listener,
		);
		const unsubscribeCreated = subscribeToEvent(
			'watched-file-undeleted',
			listener,
		);
		requests.pending = requests.pending.then(async () => {
			if (!active) {
				return;
			}

			try {
				const exists = await subscribeToFileExistenceWatcher({
					file: outName,
					clientId,
				});
				subscribed = true;
				if (active && !receivedFileEvent) {
					setResult({
						outName,
						clientId,
						exists,
						checkFailed: false,
						canOpenInFileExplorer: true,
					});
				}
			} catch {
				if (!active) {
					return;
				}

				let exists = false;
				try {
					const response = await fetch(getRenderOutputSrc(outName), {
						method: 'HEAD',
						cache: 'no-store',
						signal: controller.signal,
					});
					exists = response.status === 200;
				} catch {}

				if (active && !receivedFileEvent) {
					setResult({
						outName,
						clientId,
						exists,
						checkFailed: !exists,
						canOpenInFileExplorer: false,
					});
				}
			}
		});

		return () => {
			active = false;
			controller.abort();
			requests.activeEffects--;
			unsubscribeDeleted();
			unsubscribeCreated();
			const cleanup = requests.pending.then(async () => {
				if (!subscribed) {
					return;
				}

				await unsubscribeFromFileExistenceWatcher({
					file: outName,
					clientId,
				}).catch(() => undefined);
			});
			requests.pending = cleanup;
			cleanup.then(() => {
				if (requests.activeEffects === 0 && requests.pending === cleanup) {
					requestsByClient.delete(clientId);
				}
			});
		};
	}, [clientId, outName, subscribeToEvent]);

	return result.outName === outName && result.clientId === clientId
		? {
				exists: result.exists,
				checkFailed: result.checkFailed,
				canOpenInFileExplorer: result.canOpenInFileExplorer,
			}
		: {exists: false, checkFailed: false, canOpenInFileExplorer: false};
};
