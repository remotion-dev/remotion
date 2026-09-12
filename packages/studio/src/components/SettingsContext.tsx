import type {
	GetDefaultCodingAgentInfoResponse,
	GetDefaultEditorInfoResponse,
	GetRemotionSkillsInfoResponse,
	RenderDefaults,
	StudioRuntimeConfig,
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
import {showNotification} from './Notifications/NotificationCenter';
import {UpdateStatusProvider} from './UpdateStatusContext';

type SettingsContextValue = {
	readonly codingAgentInfo: GetDefaultCodingAgentInfoResponse | null;
	readonly editorInfo: GetDefaultEditorInfoResponse | null;
	readonly error: string | null;
	readonly publicLicenseKey: string | null;
	readonly remotionSkillsInfo: GetRemotionSkillsInfoResponse | null;
	readonly renderDefaults: RenderDefaults | null;
	readonly studioRuntimeConfig: StudioRuntimeConfig | null;
	readonly revision: number;
	readonly setPublicLicenseKey: (publicLicenseKey: string | null) => void;
	readonly installSkill: (skill: string) => Promise<void>;
	readonly installingSkill: string | null;
	readonly skillInstallError: string | null;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export const SettingsProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const {previewServerState, subscribeToEvent} = useContext(
		StudioServerConnectionCtx,
	);
	const [settings, setSettings] = useState<
		Omit<SettingsContextValue, 'setPublicLicenseKey' | 'installSkill'>
	>({
		codingAgentInfo: null,
		editorInfo: null,
		error: null,
		publicLicenseKey: window.remotion_studioConfig?.publicLicenseKey ?? null,
		remotionSkillsInfo: null,
		renderDefaults: window.remotion_renderDefaults ?? null,
		studioRuntimeConfig: window.remotion_studioConfig ?? null,
		revision: 0,
		installingSkill: null,
		skillInstallError: null,
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
			callApi('/api/remotion-skills-info', {}, controller.signal),
		])
			.then(([editorInfo, codingAgentInfo, remotionSkillsInfo]) => {
				const runtimeConfig = window.remotion_studioConfig;
				setSettings((currentSettings) => ({
					...currentSettings,
					codingAgentInfo: {
						...codingAgentInfo,
						defaultCodingAgent: runtimeConfig
							? runtimeConfig.defaultCodingAgent
							: codingAgentInfo.defaultCodingAgent,
					},
					editorInfo: {
						...editorInfo,
						defaultEditor: runtimeConfig
							? runtimeConfig.defaultEditor
							: editorInfo.defaultEditor,
					},
					remotionSkillsInfo,
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
				renderDefaults: event.renderDefaults,
				studioRuntimeConfig: event.studioRuntimeConfig,
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
	const installSkill = useCallback(async (skill: string) => {
		setSettings((currentSettings) => ({
			...currentSettings,
			installingSkill: skill,
			skillInstallError: null,
		}));
		try {
			const remotionSkillsInfo = await callApi('/api/install-remotion-skill', {
				skill,
			});
			setSettings((currentSettings) => ({
				...currentSettings,
				remotionSkillsInfo,
				installingSkill: null,
				revision: currentSettings.revision + 1,
			}));
			showNotification(
				`Installed ${skill}. Restart your coding agent to use it.`,
				5000,
			);
		} catch (err) {
			setSettings((currentSettings) => ({
				...currentSettings,
				installingSkill: null,
				skillInstallError: (err as Error).message,
			}));
		}
	}, []);
	const value = useMemo<SettingsContextValue>(() => {
		return {...settings, setPublicLicenseKey, installSkill};
	}, [installSkill, setPublicLicenseKey, settings]);

	return (
		<SettingsContext.Provider value={value}>
			<UpdateStatusProvider>{children}</UpdateStatusProvider>
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
