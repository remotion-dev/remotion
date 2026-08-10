import type {
	GetDefaultCodingAgentInfoResponse,
	GetDefaultEditorInfoResponse,
} from '@remotion/studio-shared';
import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {callApi} from './call-api';

type SettingsContextValue = {
	readonly codingAgentInfo: GetDefaultCodingAgentInfoResponse | null;
	readonly editorInfo: GetDefaultEditorInfoResponse | null;
	readonly error: string | null;
	readonly publicLicenseKey: string | null;
	readonly revision: number;
	readonly setPublicLicenseKey: (publicLicenseKey: string | null) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export const SettingsProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const {previewServerState, subscribeToEvent} = useContext(
		StudioServerConnectionCtx,
	);
	const [settings, setSettings] = useState<
		Omit<SettingsContextValue, 'setPublicLicenseKey'>
	>({
		codingAgentInfo: null,
		editorInfo: null,
		error: null,
		publicLicenseKey: window.remotion_studioConfig?.publicLicenseKey ?? null,
		revision: 0,
	});

	useEffect(() => {
		if (
			previewServerState.type !== 'connected' ||
			getBrowserStudioOperations() !== null
		) {
			return;
		}

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
				const runtimeConfig = window.remotion_studioConfig;
				setSettings((currentSettings) => ({
					...currentSettings,
					codingAgentInfo: {
						...codingAgentInfo,
						defaultCodingAgent: runtimeConfig
							? runtimeConfig.defaultCodingAgent
							: codingAgentInfo.defaultCodingAgent,
						defaultTerminal: runtimeConfig
							? runtimeConfig.defaultTerminal
							: codingAgentInfo.defaultTerminal,
					},
					editorInfo: {
						...editorInfo,
						defaultEditor: runtimeConfig
							? runtimeConfig.defaultEditor
							: editorInfo.defaultEditor,
					},
					error: null,
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
	}, [previewServerState.type]);

	useEffect(() => {
		return subscribeToEvent('config-file-changed', (event) => {
			if (event.type !== 'config-file-changed') {
				return;
			}

			setSettings((currentSettings) => ({
				...currentSettings,
				codingAgentInfo: currentSettings.codingAgentInfo
					? {
							...currentSettings.codingAgentInfo,
							defaultCodingAgent: event.studioRuntimeConfig.defaultCodingAgent,
							defaultTerminal: event.studioRuntimeConfig.defaultTerminal,
						}
					: null,
				editorInfo: currentSettings.editorInfo
					? {
							...currentSettings.editorInfo,
							defaultEditor: event.studioRuntimeConfig.defaultEditor,
						}
					: null,
				error: null,
				publicLicenseKey: event.studioRuntimeConfig.publicLicenseKey,
				revision: currentSettings.revision + 1,
			}));
		});
	}, [subscribeToEvent]);

	const setPublicLicenseKey = useCallback((publicLicenseKey: string | null) => {
		setSettings((currentSettings) => {
			if (currentSettings.publicLicenseKey === publicLicenseKey) {
				return currentSettings;
			}

			return {
				...currentSettings,
				publicLicenseKey,
				revision: currentSettings.revision + 1,
			};
		});
	}, []);
	const value = useMemo<SettingsContextValue>(() => {
		return {...settings, setPublicLicenseKey};
	}, [setPublicLicenseKey, settings]);

	return (
		<SettingsContext.Provider value={value}>
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
