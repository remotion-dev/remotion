import type {
	GetDefaultCodingAgentInfoResponse,
	GetDefaultEditorInfoResponse,
} from '@remotion/studio-shared';
import React, {createContext, useContext, useEffect, useState} from 'react';
import {useStudioConfigRevision} from '../helpers/client-id';
import {callApi} from './call-api';

type SettingsContextValue = {
	readonly codingAgentInfo: GetDefaultCodingAgentInfoResponse | null;
	readonly editorInfo: GetDefaultEditorInfoResponse | null;
	readonly error: string | null;
	readonly publicLicenseKey: string | null;
	readonly revision: number;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export const SettingsProvider: React.FC<{
	readonly children: React.ReactNode;
	readonly initialPublicLicenseKey: string | null;
}> = ({children, initialPublicLicenseKey}) => {
	const configFileChangeRevision = useStudioConfigRevision();
	const [settings, setSettings] = useState<SettingsContextValue>({
		codingAgentInfo: null,
		editorInfo: null,
		error: null,
		publicLicenseKey: initialPublicLicenseKey,
		revision: 0,
	});

	useEffect(() => {
		const controller = new AbortController();
		setSettings((currentSettings) => ({
			...currentSettings,
			error: null,
		}));

		Promise.all([
			callApi('/api/default-editor-info', {}, controller.signal),
			callApi('/api/default-coding-agent-info', {}, controller.signal),
		])
			.then(([editorInfo, codingAgentInfo]) => {
				setSettings((currentSettings) => ({
					codingAgentInfo,
					editorInfo,
					error: null,
					publicLicenseKey:
						window.remotion_renderDefaults?.publicLicenseKey ?? null,
					revision: currentSettings.revision + 1,
				}));
			})
			.catch((err) => {
				if (controller.signal.aborted) {
					return;
				}

				setSettings((currentSettings) => ({
					...currentSettings,
					error: (err as Error).message,
				}));
			});

		return () => controller.abort();
	}, [configFileChangeRevision]);

	return (
		<SettingsContext.Provider value={settings}>
			{children}
		</SettingsContext.Provider>
	);
};

export const useSettings = (): SettingsContextValue => {
	const context = useContext(SettingsContext);
	if (context === null) {
		throw new Error('useSettings must be used inside SettingsProvider');
	}

	return context;
};
