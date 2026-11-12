import type {
	ConfigUpdate,
	GetDefaultCodingAgentInfoResponse,
	GetDefaultEditorInfoResponse,
	GetRemotionSkillsInfoResponse,
	RenderDefaults,
	StudioElementLibrary,
	StudioRuntimeConfig,
} from '@remotion/studio-shared';
import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {isElementLibraryOrderApplied} from '../helpers/element-libraries';
import {canEditStudioConfig} from '../helpers/settings-tab-availability';
import {
	appSelectedEvent,
	codingAgentHistory,
	editorHistory,
} from '../state/recently-used-apps';
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
	readonly showDiagnostics: boolean;
	readonly setShowDiagnostics: (visible: boolean) => void;
	readonly setPublicLicenseKey: (publicLicenseKey: string | null) => void;
	readonly addElementLibrary: (
		library: StudioElementLibrary,
	) => Promise<boolean>;
	readonly removeElementLibrary: (url: string) => Promise<void>;
	readonly reorderElementLibraries: (urls: readonly string[]) => Promise<void>;
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
			| 'setPublicLicenseKey'
			| 'installSkill'
			| 'removeSkill'
			| 'upgradeSkill'
			| 'showDiagnostics'
			| 'setShowDiagnostics'
			| 'addElementLibrary'
			| 'removeElementLibrary'
			| 'reorderElementLibraries'
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
	const [showDiagnosticsPreview, setShowDiagnosticsPreview] = useState<
		boolean | null
	>(null);
	const diagnosticsSaveQueue = useRef<Promise<void>>(Promise.resolve());
	const studioRuntimeConfigRef = useRef(settings.studioRuntimeConfig);
	studioRuntimeConfigRef.current = settings.studioRuntimeConfig;
	const elementLibraryRemovals = useRef(new Map<string, {saved: boolean}>());
	const elementLibraryAdditions = useRef(
		new Map<string, {library: StudioElementLibrary; saved: boolean}>(),
	);
	const [addedElementLibraries, setAddedElementLibraries] = useState<
		StudioElementLibrary[]
	>([]);
	const elementLibraryOrder = useRef<{urls: string[]; saved: boolean} | null>(
		null,
	);
	const [orderedElementLibraryUrls, setOrderedElementLibraryUrls] = useState<
		string[] | null
	>(null);
	const elementLibrarySaveQueue = useRef<Promise<unknown>>(Promise.resolve());
	const saveElementLibraryUpdates = useCallback(
		(updates: ConfigUpdate[]) => {
			if (previewServerState.type !== 'connected') {
				return Promise.reject(new Error('Studio is disconnected.'));
			}

			const save = elementLibrarySaveQueue.current.then(() =>
				callApi('/api/update-config', {
					clientId: previewServerState.clientId,
					updates,
				}),
			);
			elementLibrarySaveQueue.current = save.catch(() => {});
			return save;
		},
		[previewServerState],
	);
	const [removedElementLibraryUrls, setRemovedElementLibraryUrls] = useState<
		string[]
	>([]);
	const addElementLibrary = useCallback(
		async (library: StudioElementLibrary) => {
			if (
				!canEditStudioConfig({
					isBrowserStudio: getBrowserStudioOperations() !== null,
					previewServerConnected: previewServerState.type === 'connected',
					readOnlyStudio: window.remotion_isReadOnlyStudio,
				})
			)
				return false;

			if (
				!elementLibraryRemovals.current.has(library.url) &&
				(elementLibraryAdditions.current.has(library.url) ||
					studioRuntimeConfigRef.current?.elementLibraries.some(
						(existing) => existing.url === library.url,
					))
			)
				return true;

			elementLibraryRemovals.current.delete(library.url);
			setRemovedElementLibraryUrls([...elementLibraryRemovals.current.keys()]);
			const request = {library, saved: false};
			elementLibraryAdditions.current.set(library.url, request);
			setAddedElementLibraries(
				[...elementLibraryAdditions.current.values()].map(
					(entry) => entry.library,
				),
			);
			try {
				const response = await saveElementLibraryUpdates([
					{
						setter: 'addElementLibrary',
						type: 'set',
						value: {
							url: library.url,
							...(library.displayName === null
								? {}
								: {displayName: library.displayName}),
							...(library.captionStylesUrl === null
								? {}
								: {captionStylesUrl: library.captionStylesUrl}),
						},
					},
				]);
				if (!response.success) throw new Error(response.reason);
				if (elementLibraryAdditions.current.get(library.url) !== request)
					return true;
				request.saved = true;
				if (
					studioRuntimeConfigRef.current?.elementLibraries.some(
						(existing) => existing.url === library.url,
					)
				) {
					elementLibraryAdditions.current.delete(library.url);
					setAddedElementLibraries(
						[...elementLibraryAdditions.current.values()].map(
							(entry) => entry.library,
						),
					);
				}

				return true;
			} catch (err) {
				if (elementLibraryAdditions.current.get(library.url) !== request)
					return false;
				elementLibraryAdditions.current.delete(library.url);
				setAddedElementLibraries(
					[...elementLibraryAdditions.current.values()].map(
						(entry) => entry.library,
					),
				);
				showNotification(
					`Could not add element library: ${(err as Error).message}`,
					5000,
				);
				return false;
			}
		},
		[previewServerState.type, saveElementLibraryUpdates],
	);
	const removeElementLibrary = useCallback(
		async (url: string) => {
			if (
				!canEditStudioConfig({
					isBrowserStudio: getBrowserStudioOperations() !== null,
					previewServerConnected: previewServerState.type === 'connected',
					readOnlyStudio: window.remotion_isReadOnlyStudio,
				}) ||
				previewServerState.type !== 'connected' ||
				elementLibraryRemovals.current.has(url) ||
				(!elementLibraryAdditions.current.has(url) &&
					!studioRuntimeConfigRef.current?.elementLibraries.some(
						(library) => library.url === url,
					))
			) {
				return;
			}

			const request = {saved: false};
			elementLibraryRemovals.current.set(url, request);
			setRemovedElementLibraryUrls([...elementLibraryRemovals.current.keys()]);
			try {
				const response = await saveElementLibraryUpdates([
					{setter: 'addElementLibrary', type: 'delete', value: url},
				]);
				if (!response.success) throw new Error(response.reason);
				if (elementLibraryRemovals.current.get(url) !== request) return;
				request.saved = true;
				if (
					!studioRuntimeConfigRef.current?.elementLibraries.some(
						(library) => library.url === url,
					)
				) {
					elementLibraryRemovals.current.delete(url);
					setRemovedElementLibraryUrls([
						...elementLibraryRemovals.current.keys(),
					]);
				}
			} catch (err) {
				if (elementLibraryRemovals.current.get(url) !== request) return;
				elementLibraryRemovals.current.delete(url);
				setRemovedElementLibraryUrls([
					...elementLibraryRemovals.current.keys(),
				]);
				showNotification(
					`Could not remove element library: ${(err as Error).message}`,
					5000,
				);
			}
		},
		[previewServerState, saveElementLibraryUpdates],
	);
	const reorderElementLibraries = useCallback(
		async (urls: readonly string[]) => {
			if (
				!canEditStudioConfig({
					isBrowserStudio: getBrowserStudioOperations() !== null,
					previewServerConnected: previewServerState.type === 'connected',
					readOnlyStudio: window.remotion_isReadOnlyStudio,
				})
			)
				return;

			const currentUrls = [
				...new Set(
					[
						...(studioRuntimeConfigRef.current?.elementLibraries ?? []),
						...[...elementLibraryAdditions.current.values()].map(
							(entry) => entry.library,
						),
					]
						.filter(
							(library) => !elementLibraryRemovals.current.has(library.url),
						)
						.map((library) => library.url),
				),
			];
			if (
				urls.length !== currentUrls.length ||
				new Set(urls).size !== urls.length ||
				currentUrls.some((url) => !urls.includes(url))
			)
				return;

			const request = {urls: [...urls], saved: false};
			elementLibraryOrder.current = request;
			setOrderedElementLibraryUrls(request.urls);
			try {
				const response = await saveElementLibraryUpdates([
					{setter: 'addElementLibrary', type: 'reorder', value: request.urls},
				]);
				if (!response.success) throw new Error(response.reason);
				if (elementLibraryOrder.current !== request) return;
				request.saved = true;
				if (
					isElementLibraryOrderApplied(
						urls,
						studioRuntimeConfigRef.current?.elementLibraries ?? [],
					)
				) {
					elementLibraryOrder.current = null;
					setOrderedElementLibraryUrls(null);
				}
			} catch (err) {
				if (elementLibraryOrder.current !== request) return;
				elementLibraryOrder.current = null;
				setOrderedElementLibraryUrls(null);
				showNotification(
					`Could not reorder element libraries: ${(err as Error).message}`,
					5000,
				);
			}
		},
		[previewServerState.type, saveElementLibraryUpdates],
	);
	const diagnosticsSave = useRef<{
		value: boolean;
		saved: boolean;
		initialRuntimeConfig: StudioRuntimeConfig | null;
	} | null>(null);
	const setShowDiagnostics = useCallback(
		(visible: boolean) => {
			if (
				previewServerState.type !== 'connected' ||
				studioRuntimeConfigRef.current?.showDiagnostics.source === 'cli'
			) {
				return;
			}

			const request = {
				value: visible,
				saved: false,
				initialRuntimeConfig: studioRuntimeConfigRef.current,
			};
			diagnosticsSave.current = request;
			setShowDiagnosticsPreview(visible);
			setSettings((current) => ({...current, error: null}));
			diagnosticsSaveQueue.current = diagnosticsSaveQueue.current
				.then(() =>
					callApi('/api/update-config', {
						clientId: previewServerState.clientId,
						updates: [
							{setter: 'setShowDiagnostics', type: 'set', value: visible},
						],
					}),
				)
				.then((response) => {
					if (!response.success) throw new Error(response.reason);
					if (diagnosticsSave.current !== request) return;
					request.saved = true;
					const runtimeConfig = studioRuntimeConfigRef.current;
					if (
						runtimeConfig !== request.initialRuntimeConfig &&
						runtimeConfig?.showDiagnostics.value === request.value
					) {
						diagnosticsSave.current = null;
						setShowDiagnosticsPreview(null);
					}
				})
				.catch((err: Error) => {
					if (diagnosticsSave.current !== request) return;
					diagnosticsSave.current = null;
					setShowDiagnosticsPreview(null);
					setSettings((current) => ({...current, error: err.message}));
					showNotification(
						`Could not save diagnostics setting: ${err.message}`,
						5000,
					);
				});
		},
		[previewServerState],
	);

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
			callApi(
				'/api/app-info',
				{
					editor: {recentlyUsedIds: editorHistory.getRecentlyUsed()},
					codingAgent: {recentlyUsedIds: codingAgentHistory.getRecentlyUsed()},
				},
				requestController.signal,
			)
				.then(({codingAgentInfo, editorInfo}) => {
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

			studioRuntimeConfigRef.current = event.studioRuntimeConfig;
			for (const [url, addition] of elementLibraryAdditions.current) {
				if (
					addition.saved &&
					event.studioRuntimeConfig.elementLibraries.some(
						(library) => library.url === url,
					)
				) {
					elementLibraryAdditions.current.delete(url);
				}
			}

			setAddedElementLibraries((current) =>
				current.length === elementLibraryAdditions.current.size
					? current
					: [...elementLibraryAdditions.current.values()].map(
							(entry) => entry.library,
						),
			);
			const order = elementLibraryOrder.current;
			if (
				order?.saved &&
				isElementLibraryOrderApplied(
					order.urls,
					event.studioRuntimeConfig.elementLibraries,
				)
			) {
				elementLibraryOrder.current = null;
				setOrderedElementLibraryUrls(null);
			}

			for (const [url, removal] of elementLibraryRemovals.current) {
				if (
					removal.saved &&
					!event.studioRuntimeConfig.elementLibraries.some(
						(library) => library.url === url,
					)
				) {
					elementLibraryRemovals.current.delete(url);
				}
			}

			setRemovedElementLibraryUrls((current) =>
				current.length === elementLibraryRemovals.current.size
					? current
					: [...elementLibraryRemovals.current.keys()],
			);
			const request = diagnosticsSave.current;
			if (
				event.studioRuntimeConfig.showDiagnostics.source === 'cli' ||
				(request?.saved &&
					event.studioRuntimeConfig.showDiagnostics.value === request.value)
			) {
				diagnosticsSave.current = null;
				setShowDiagnosticsPreview(null);
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

	useEffect(() => {
		return subscribeToEvent('config-file-reload-failed', (event) => {
			if (event.type === 'config-file-reload-failed') {
				if (elementLibraryAdditions.current.size > 0) {
					elementLibraryAdditions.current.clear();
					setAddedElementLibraries([]);
					showNotification(
						`Could not reload element libraries: ${event.errorMessage}`,
						5000,
					);
				}

				if (elementLibraryOrder.current !== null) {
					elementLibraryOrder.current = null;
					setOrderedElementLibraryUrls(null);
					showNotification(
						`Could not reload element libraries: ${event.errorMessage}`,
						5000,
					);
				}

				if (elementLibraryRemovals.current.size > 0) {
					elementLibraryRemovals.current.clear();
					setRemovedElementLibraryUrls([]);
					showNotification(
						`Could not reload element libraries: ${event.errorMessage}`,
						5000,
					);
				}

				if (diagnosticsSave.current !== null) {
					diagnosticsSave.current = null;
					setShowDiagnosticsPreview(null);
				}

				setSettings((current) => ({
					...current,
					error: event.errorMessage,
					revision: current.revision + 1,
				}));
			}
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
		let {studioRuntimeConfig} = settings;
		if (
			studioRuntimeConfig &&
			(orderedElementLibraryUrls !== null ||
				addedElementLibraries.length > 0 ||
				removedElementLibraryUrls.length > 0)
		) {
			const libraries = [
				...new Map(
					[
						...studioRuntimeConfig.elementLibraries,
						...addedElementLibraries,
					].map((library) => [library.url, library]),
				).values(),
			];
			const order = new Map(
				orderedElementLibraryUrls?.map((url, index) => [url, index]),
			);
			studioRuntimeConfig = {
				...studioRuntimeConfig,
				elementLibraries: libraries
					.filter((library) => !removedElementLibraryUrls.includes(library.url))
					.sort(
						(a, b) =>
							(order.get(a.url) ?? order.size) -
							(order.get(b.url) ?? order.size),
					),
			};
		}

		return {
			...settings,
			studioRuntimeConfig,
			addElementLibrary,
			removeElementLibrary,
			reorderElementLibraries,
			showDiagnostics:
				showDiagnosticsPreview ??
				settings.studioRuntimeConfig?.showDiagnostics.value ??
				false,
			setShowDiagnostics,
			setPublicLicenseKey,
			installSkill,
			removeSkill,
			upgradeSkill,
		};
	}, [
		installSkill,
		removeSkill,
		setPublicLicenseKey,
		settings,
		upgradeSkill,
		showDiagnosticsPreview,
		setShowDiagnostics,
		addElementLibrary,
		addedElementLibraries,
		removeElementLibrary,
		removedElementLibraryUrls,
		orderedElementLibraryUrls,
		reorderElementLibraries,
	]);

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
