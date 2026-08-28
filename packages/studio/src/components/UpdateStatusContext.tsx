import type {UpdateAvailableResponse} from '@remotion/studio-shared';
import React, {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import {VERSION} from 'remotion';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {canShowUpdates} from '../helpers/can-show-updates';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {updateAvailable} from './RenderQueue/actions';

// Keep in sync with packages/bugs/api/[v].ts
export type Bug = {
	title: string;
	description: string;
	link: string;
	versions: string[];
};

type UpdateStatusContextValue = {
	readonly error: string | null;
	readonly info: UpdateAvailableResponse | null;
	readonly knownBugs: Bug[] | null;
};

const UpdateStatusContext = createContext<UpdateStatusContextValue | null>(
	null,
);

export const UpdateStatusProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const [info, setInfo] = useState<UpdateAvailableResponse | null>(null);
	const [knownBugs, setKnownBugs] = useState<Bug[] | null>(null);
	const [error, setError] = useState<string | null>(null);
	const showUpdates = canShowUpdates({
		connectionStatus: previewServerState.type,
		isBrowserStudio: getBrowserStudioOperations() !== null,
		readOnlyStudio: window.remotion_isReadOnlyStudio,
	});

	useEffect(() => {
		if (!showUpdates) {
			setInfo(null);
			setKnownBugs(null);
			setError(null);
			return;
		}

		const updateController = new AbortController();
		const bugsController = new AbortController();

		updateAvailable(updateController.signal)
			.then((response) => {
				setInfo(response);
				setError(null);
			})
			.catch((err: Error) => {
				if (updateController.signal.aborted) {
					return;
				}

				setError(err.message);
			});

		fetch('https://bugs.remotion.dev/api/' + VERSION, {
			signal: bugsController.signal,
		})
			.then(async (response) => {
				const body = await response.json();
				setKnownBugs(body.bugs);
			})
			.catch((err: Error) => {
				if (bugsController.signal.aborted) {
					return;
				}

				// eslint-disable-next-line no-console
				console.log('Could not check for bugs in this version', err);
			});

		return () => {
			updateController.abort();
			bugsController.abort();
		};
	}, [showUpdates]);

	const value = useMemo<UpdateStatusContextValue>(() => {
		return {error, info, knownBugs};
	}, [error, info, knownBugs]);

	return (
		<UpdateStatusContext.Provider value={value}>
			{children}
		</UpdateStatusContext.Provider>
	);
};

export const useUpdateStatus = (): UpdateStatusContextValue => {
	const context = useContext(UpdateStatusContext);
	if (context === null) {
		throw new Error('useUpdateStatus must be used inside UpdateStatusProvider');
	}

	return context;
};
