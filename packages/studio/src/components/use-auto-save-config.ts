import type {ConfigUpdate} from '@remotion/studio-shared';
import {useContext, useEffect, useMemo, useRef} from 'react';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {callApi} from './call-api';

export const useAutoSaveConfig = ({
	enabled,
	onError,
	ready,
	syncRevision,
	updates,
}: {
	readonly enabled: boolean;
	readonly onError: (error: string | null) => void;
	readonly ready: boolean;
	readonly syncRevision: number;
	readonly updates: ConfigUpdate[];
}) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const serializedUpdates = useMemo(() => JSON.stringify(updates), [updates]);
	const initialUpdates = useRef<string | null>(null);
	const lastQueuedUpdates = useRef<string | null>(null);
	const lastSyncRevision = useRef<number | null>(null);
	const syncGeneration = useRef(0);
	const saveQueue = useRef<Promise<void>>(Promise.resolve());
	const mounted = useRef(true);

	useEffect(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);

	useEffect(() => {
		if (!ready) {
			return;
		}

		if (
			initialUpdates.current === null ||
			lastSyncRevision.current !== syncRevision
		) {
			initialUpdates.current = serializedUpdates;
			lastQueuedUpdates.current = serializedUpdates;
			lastSyncRevision.current = syncRevision;
			syncGeneration.current++;
			return;
		}

		if (
			!enabled ||
			previewServerState.type !== 'connected' ||
			lastQueuedUpdates.current === serializedUpdates
		) {
			return;
		}

		lastQueuedUpdates.current = serializedUpdates;
		onError(null);
		const generation = syncGeneration.current;
		saveQueue.current = saveQueue.current.then(async () => {
			if (generation !== syncGeneration.current) {
				return;
			}

			try {
				const response = await callApi('/api/update-config', {
					clientId: previewServerState.clientId,
					updates,
				});
				if (
					!response.success &&
					mounted.current &&
					lastQueuedUpdates.current === serializedUpdates
				) {
					onError(response.reason);
				}
			} catch (err) {
				if (
					mounted.current &&
					lastQueuedUpdates.current === serializedUpdates
				) {
					onError((err as Error).message);
				}
			}
		});
	}, [
		enabled,
		onError,
		previewServerState,
		ready,
		serializedUpdates,
		syncRevision,
		updates,
	]);
};
