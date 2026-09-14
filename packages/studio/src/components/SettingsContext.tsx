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

type SkillAction = {
	readonly skill: string;
	readonly type: 'installing' | 'removing';
};

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
	readonly removeSkill: (skill: string) => Promise<void>;
	readonly skillAction: SkillAction | null;
	readonly skillActionError: string | null;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export const SettingsProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const {previewServerState, subscribeToEvent} = useContext(
		StudioServerConnectionCtx,
	);
	const [settings, setSettings] = useState<
		Omit<
			SettingsContextValue,
			'setPublicLicenseKey' | 'installSkill' | 'removeSkill'
		>
	>({
		codingAgentInfo: null,
		editorInfo: null,
		error: null,
		publicLicenseKey: window.remotion_studioConfig?.publicLicenseKey ?? null,
		remotionSkillsInfo: null,
		renderDefaults: window.remotion_renderDefaults ?? null,
		studioRuntimeConfig: window.remotion_studioConfig ?? null,
		revision: 0,
		skillAction: null,
		skillActionError: null,
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
			skillAction: {skill, type: 'installing'},
			skillActionError: null,
		}));
		try {
			const remotionSkillsInfo = await callApi('/api/install-remotion-skill', {
				skill,
			});
			setSettings((currentSettings) => ({
				...currentSettings,
				remotionSkillsInfo,
				skillAction: null,
				revision: currentSettings.revision + 1,
			}));
			showNotification(`Installed ${skill}.`, 5000);
		} catch (err) {
			setSettings((currentSettings) => ({
				...currentSettings,
				skillAction: null,
				skillActionError: (err as Error).message,
			}));
		}
	}, []);
	const removeSkill = useCallback(async (skill: string) => {
		setSettings((currentSettings) => ({
			...currentSettings,
			skillAction: {skill, type: 'removing'},
			skillActionError: null,
		}));
		try {
			const remotionSkillsInfo = await callApi('/api/remove-remotion-skill', {
				skill,
			});
			setSettings((currentSettings) => ({
				...currentSettings,
				remotionSkillsInfo,
				skillAction: null,
				revision: currentSettings.revision + 1,
			}));
			const remainingSkill = remotionSkillsInfo.skills.find(
				({name}) => name === skill,
			);
			showNotification(
				remainingSkill?.installedGlobally
					? `Removed ${skill} from this project. It is still installed globally.`
					: `Removed ${skill}. Restart your coding agent to stop using it.`,
				5000,
			);
		} catch (err) {
			setSettings((currentSettings) => ({
				...currentSettings,
				skillAction: null,
				skillActionError: (err as Error).message,
			}));
		}
	}, []);
	const value = useMemo<SettingsContextValue>(() => {
		return {...settings, setPublicLicenseKey, installSkill, removeSkill};
	}, [installSkill, removeSkill, setPublicLicenseKey, settings]);

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
