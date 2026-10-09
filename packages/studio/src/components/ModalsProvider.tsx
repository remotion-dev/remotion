import React, {useMemo, useState} from 'react';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import type {ModalState, SetSelectedModalContextType} from '../state/modals';
import {SelectedModalContext, SetSelectedModalContext} from '../state/modals';
import {experimentalNoticeStorageKey} from './BrowserStudioExperimentingNotice';

export const ModalsProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [selectedModal, setSelectedModal] = useState<ModalState | null>(() => {
		if (
			getBrowserStudioOperations() === null ||
			!window.remotion_showBrowserStudioExperimentalNotice
		) {
			return null;
		}

		try {
			if (
				window.localStorage.getItem(experimentalNoticeStorageKey) === 'true'
			) {
				return null;
			}
		} catch {
			// Show the notice even when browser storage is unavailable.
		}

		return {type: 'browser-studio-experimental-notice'};
	});

	const setSelectedModalContext = useMemo((): SetSelectedModalContextType => {
		return {
			setSelectedModal,
		};
	}, []);

	return (
		<SetSelectedModalContext.Provider value={setSelectedModalContext}>
			<SelectedModalContext.Provider value={selectedModal}>
				{children}
			</SelectedModalContext.Provider>
		</SetSelectedModalContext.Provider>
	);
};
