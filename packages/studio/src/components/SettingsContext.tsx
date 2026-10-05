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
import {appSelectedEvent} from '../state/recently-used-apps';
import {callApi} from './call-api';
import {showNotification} from './Notifications/NotificationCenter';
import {UpdateStatusProvider} from './UpdateStatusContext';

type SkillAction = {
	readonly skill: string;
	readonly type: 'installing' | 'removing' | 'upgrading';
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
	readonly upgradeSkill: (skill: string) => Promise<void>;
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
			'setPublicLicenseKey' | 'installSkill' | 'removeSkill' | 'upgradeSkill'
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
	const [skillsRevision, setSkillsRevision] = useState(0);

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

		callApi('/api/remotion-skills-info', {}, controller.signal)
			.then((remotionSkillsInfo) => {
				setSettings((currentSettings) => ({
					...currentSettings,
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
		if (
			previewServerState.type !== 'connected' ||
			getBrowserStudioOperations() !== null
		) {
			return;
		}

		let controller: AbortController | null = null;
		const refreshApps = () => {
			controller?.abort();
			const requestController = new AbortController();
			controller = requestController;
			Promise.all([
				callApi('/api/default-coding-agent-info', {}, requestController.signal),
				callApi('/api/default-editor-info', {}, requestController.signal),
			])
				.then(([codingAgentInfo, editorInfo]) => {
					if (requestController.signal.aborted) {
						return;
					}

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
					}));
				})
				.catch((err) => {
					if (requestController.signal.aborted) {
						return;
					}

					setSettings((currentSettings) => ({
						...currentSettings,
						error: (err as Error).message,
					}));
				});
		};

		refreshApps();
		window.addEventListener('focus', refreshApps);
		window.addEventListener(appSelectedEvent, refreshApps);
		window.addEventListener('storage', refreshApps);

		return () => {
			controller?.abort();
			window.removeEventListener('focus', refreshApps);
			window.removeEventListener(appSelectedEvent, refreshApps);
			window.removeEventListener('storage', refreshApps);
		};
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
	const changeSkill = useCallback(
		async (skill: string, action: 'install' | 'remove' | 'upgrade') => {
			setSettings((currentSettings) => ({
				...currentSettings,
				skillAction: {
					skill,
					type:
						action === 'install'
							? 'installing'
							: action === 'upgrade'
								? 'upgrading'
								: 'removing',
				},
				skillActionError: null,
			}));
			try {
				const endpoint =
					action === 'install'
						? '/api/install-remotion-skill'
						: action === 'upgrade'
							? '/api/upgrade-remotion-skill'
							: '/api/remove-remotion-skill';
				const remotionSkillsInfo = await callApi(endpoint, {
					skill,
				});
				setSettings((currentSettings) => ({
					...currentSettings,
					remotionSkillsInfo,
					skillAction: null,
					revision: currentSettings.revision + 1,
				}));
				setSkillsRevision((revision) => revision + 1);
				const verb =
					action === 'install'
						? 'Installed'
						: action === 'upgrade'
							? 'Upgraded'
							: 'Removed';
				showNotification(`${verb} ${skill}.`, 5000);
			} catch (err) {
				const remotionSkillsInfo = await callApi(
					'/api/remotion-skills-info',
					{},
				).catch(() => null);
				setSettings((currentSettings) => ({
					...currentSettings,
					remotionSkillsInfo:
						remotionSkillsInfo ?? currentSettings.remotionSkillsInfo,
					skillAction: null,
					skillActionError: (err as Error).message,
				}));
				if (remotionSkillsInfo !== null) {
					setSkillsRevision((revision) => revision + 1);
				}
			}
		},
		[],
	);
	const installSkill = useCallback(
		(skill: string) => changeSkill(skill, 'install'),
		[changeSkill],
	);
	const removeSkill = useCallback(
		(skill: string) => changeSkill(skill, 'remove'),
		[changeSkill],
	);
	const upgradeSkill = useCallback(
		(skill: string) => changeSkill(skill, 'upgrade'),
		[changeSkill],
	);
	const value = useMemo<SettingsContextValue>(() => {
		return {
			...settings,
			setPublicLicenseKey,
			installSkill,
			removeSkill,
			upgradeSkill,
		};
	}, [installSkill, removeSkill, setPublicLicenseKey, settings, upgradeSkill]);

	return (
		<SettingsContext.Provider value={value}>
			<UpdateStatusProvider skillsRevision={skillsRevision}>
				{children}
			</UpdateStatusProvider>
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
