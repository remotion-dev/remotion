import type {DefaultCodingAgent} from '@remotion/renderer';
import type {EditorPickerId} from '@remotion/studio-shared';
import type {SetStateAction} from 'react';
import type {ResolvedStackLocation, _InternalTypes} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {
	formatContextForAgents,
	formatFileLocation,
} from '../helpers/format-file-location';
import {
	getDefaultOpenInTarget,
	getGitSourceName,
	openGitSource,
} from '../helpers/get-git-menu-item';
import {
	loadCompositionComponentInfo,
	openCompositionComponentInEditor,
	openInCodingAgent,
	openOriginalPositionInEditor,
} from '../helpers/open-in-editor';
import type {PreviewServerConnectionState} from '../helpers/preview-server-events';
import type {ModalState} from '../state/modals';
import {getOpenInMenuItems} from './get-open-in-menu-items';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {showNotification} from './Notifications/NotificationCenter';
import {getOpenInNewWindowMenuItem} from './open-in-new-window';
import {openInFileExplorer} from './RenderQueue/actions';
import type {OpenInMenuApps} from './use-open-in-menu-apps';

export const getCompositionMenuItems = ({
	composition,
	connectionStatus,
	resolvedLocation,
	setSelectedModal,
	closeMenu,
	readOnlyStudio,
	includeCompositionManagementItems,
	openInApps,
}: {
	composition: _InternalTypes['AnyComposition'] | null;
	connectionStatus: PreviewServerConnectionState['type'];
	resolvedLocation: ResolvedStackLocation | null;
	setSelectedModal: (value: SetStateAction<ModalState | null>) => void;
	closeMenu: () => void;
	readOnlyStudio: boolean;
	includeCompositionManagementItems: boolean;
	openInApps: OpenInMenuApps;
}): ComboboxValue[] => {
	const {
		canOpenDesktopApps,
		canOpenInEditor,
		codingAgentInfo,
		defaultEditorId,
		defaultEditorName,
		editorInfo,
		onConfigureApps,
	} = openInApps;
	const fileLocation = formatFileLocation({
		location: resolvedLocation,
		root: window.remotion_cwd,
	});
	const contextForAgents = formatContextForAgents({
		location: resolvedLocation,
		name: composition?.id ?? null,
		root: window.remotion_cwd,
	});
	const openCompositionInEditorDisabled =
		!defaultEditorId || !composition || !canOpenInEditor || !resolvedLocation;
	const openComponentInEditorDisabled =
		openCompositionInEditorDisabled || !resolvedLocation?.source;
	const gitSourceName = window.remotion_gitSource
		? getGitSourceName(window.remotion_gitSource)
		: null;
	const defaultOpenInTarget = getDefaultOpenInTarget({canOpenInEditor});
	const defaultOpenInName =
		defaultOpenInTarget === 'editor' ? defaultEditorName : gitSourceName;
	const openCompositionInGitSourceDisabled = !composition || !resolvedLocation;
	const openComponentInGitSourceDisabled =
		openCompositionInGitSourceDisabled ||
		!resolvedLocation?.source ||
		(!readOnlyStudio && connectionStatus !== 'connected');
	const copyFileLocationDisabled = !composition || !fileLocation;
	const openWithCodingAgent = async (
		codingAgentId: DefaultCodingAgent,
		codingAgentName: string,
	) => {
		try {
			const response = await openInCodingAgent(
				codingAgentId,
				codingAgentId === 'copilot' ? null : contextForAgents,
			);
			if (!response.success) {
				showNotification(`Could not open ${codingAgentName}`, 2000);
			}
		} catch (err) {
			showNotification((err as Error).message, 2000);
		}
	};

	const openCompositionWithEditor = async (editorId: EditorPickerId) => {
		closeMenu();
		if (!composition || !resolvedLocation) {
			return;
		}

		try {
			await openOriginalPositionInEditor(resolvedLocation, editorId);
		} catch (err) {
			showNotification((err as Error).message, 2000);
		}
	};

	const openComponentWithEditor = async (editorId: EditorPickerId) => {
		closeMenu();
		if (!composition || !resolvedLocation?.source) {
			return;
		}

		try {
			await openCompositionComponentInEditor({
				compositionFile: resolvedLocation.source,
				compositionId: composition.id,
				editorId,
			});
		} catch (err) {
			showNotification((err as Error).message, 2000);
		}
	};

	const openComponentInGitSource = async () => {
		closeMenu();
		if (!composition || !resolvedLocation?.source) {
			return;
		}

		try {
			const info = await loadCompositionComponentInfo({
				compositionFile: resolvedLocation.source,
				compositionId: composition.id,
			});
			openGitSource({folder: false, location: info.location});
		} catch (err) {
			showNotification((err as Error).message, 2000);
		}
	};

	const openCompositionInFileExplorer = () => {
		if (!resolvedLocation?.source) {
			return;
		}

		openInFileExplorer({directory: resolvedLocation.source}).catch((err) => {
			showNotification(`Could not open file: ${err.message}`, 2000);
		});
	};

	const openComponentInFileExplorer = async () => {
		if (!composition || !resolvedLocation?.source) {
			return;
		}

		try {
			const info = await loadCompositionComponentInfo({
				compositionFile: resolvedLocation.source,
				compositionId: composition.id,
			});
			await openInFileExplorer({directory: info.location.source});
		} catch (err) {
			showNotification(`Could not open file: ${(err as Error).message}`, 2000);
		}
	};

	const commonOpenInMenuItems = {
		canOpenDesktopApps,
		codingAgentInfo,
		editorInfo,
		excludeCodingAgentId: null,
		excludeEditorId: defaultOpenInTarget === 'editor' ? defaultEditorId : null,
		excludeGitSource: defaultOpenInTarget === 'git-source',
		folder: false,
		onConfigureApps,
		onOpenInCodingAgent: (codingAgentId: DefaultCodingAgent, name: string) => {
			openWithCodingAgent(codingAgentId, name).catch(() => undefined);
		},
		onOpenInGitClient: () => undefined,
		onOpenInTerminal: null,
	};
	const compositionOpenInMenuItems = getOpenInMenuItems({
		...commonOpenInMenuItems,
		editorDisabled: openCompositionInEditorDisabled,
		fileManagerDisabled:
			!resolvedLocation?.source || connectionStatus !== 'connected',
		gitSourceDisabled: openCompositionInGitSourceDisabled,
		onOpenInEditor: (editorId) => {
			openCompositionWithEditor(editorId).catch(() => undefined);
		},
		onOpenInFileExplorer: openCompositionInFileExplorer,
		onOpenInGitSource: () => {
			closeMenu();
			openGitSource({folder: false, location: resolvedLocation});
		},
	});
	const componentOpenInMenuItems = getOpenInMenuItems({
		...commonOpenInMenuItems,
		editorDisabled: openComponentInEditorDisabled,
		fileManagerDisabled:
			!resolvedLocation?.source || connectionStatus !== 'connected',
		gitSourceDisabled: openComponentInGitSourceDisabled,
		onOpenInEditor: (editorId) => {
			openComponentWithEditor(editorId).catch(() => undefined);
		},
		onOpenInFileExplorer: () => {
			openComponentInFileExplorer().catch(() => undefined);
		},
		onOpenInGitSource: () => {
			openComponentInGitSource().catch(() => undefined);
		},
	});
	const hasOpenInItems =
		defaultOpenInName !== null ||
		compositionOpenInMenuItems.length > 0 ||
		componentOpenInMenuItems.length > 0;

	return [
		defaultOpenInTarget && defaultOpenInName
			? {
					id:
						defaultOpenInTarget === 'editor'
							? 'show-in-editor'
							: 'open-composition-in-git-source',
					keyHint: null,
					label: `Open composition in ${defaultOpenInName}`,
					leftItem: null,
					onClick: () => {
						if (defaultOpenInTarget === 'editor' && defaultEditorId !== null) {
							openCompositionWithEditor(defaultEditorId).catch(() => undefined);
						} else if (defaultOpenInTarget === 'git-source') {
							closeMenu();
							openGitSource({folder: false, location: resolvedLocation});
						}
					},
					quickSwitcherLabel: `Open composition in ${defaultOpenInName}`,
					subMenu: null,
					type: 'item' as const,
					value:
						defaultOpenInTarget === 'editor'
							? 'show-in-editor'
							: 'open-composition-in-git-source',
					disabled:
						defaultOpenInTarget === 'editor'
							? openCompositionInEditorDisabled
							: openCompositionInGitSourceDisabled,
				}
			: null,
		compositionOpenInMenuItems.length > 0
			? {
					id: 'open-composition-in-another-app',
					keyHint: null,
					label: 'Open composition in...',
					leftItem: null,
					onClick: () => undefined,
					quickSwitcherLabel: null,
					subMenu: {
						items: compositionOpenInMenuItems,
						leaveLeftSpace: true,
						preselectIndex: false as const,
					},
					type: 'item' as const,
					value: 'open-composition-in-another-app',
				}
			: null,
		defaultOpenInTarget && defaultOpenInName
			? {
					id:
						defaultOpenInTarget === 'editor'
							? 'open-component-in-editor'
							: 'open-component-in-git-source',
					keyHint: null,
					label: `Open component in ${defaultOpenInName}`,
					leftItem: null,
					onClick: () => {
						if (defaultOpenInTarget === 'editor' && defaultEditorId !== null) {
							openComponentWithEditor(defaultEditorId).catch(() => undefined);
						} else if (defaultOpenInTarget === 'git-source') {
							openComponentInGitSource().catch(() => undefined);
						}
					},
					quickSwitcherLabel: `Open composition component in ${defaultOpenInName}`,
					subMenu: null,
					type: 'item' as const,
					value:
						defaultOpenInTarget === 'editor'
							? 'open-component-in-editor'
							: 'open-component-in-git-source',
					disabled:
						defaultOpenInTarget === 'editor'
							? openComponentInEditorDisabled
							: openComponentInGitSourceDisabled,
				}
			: null,
		componentOpenInMenuItems.length > 0
			? {
					id: 'open-component-in-another-app',
					keyHint: null,
					label: 'Open component in...',
					leftItem: null,
					onClick: () => undefined,
					quickSwitcherLabel: null,
					subMenu: {
						items: componentOpenInMenuItems,
						leaveLeftSpace: true,
						preselectIndex: false as const,
					},
					type: 'item' as const,
					value: 'open-component-in-another-app',
				}
			: null,
		hasOpenInItems && includeCompositionManagementItems
			? {
					type: 'divider' as const,
					id: 'show-in-editor-divider',
				}
			: null,
		includeCompositionManagementItems
			? {
					id: 'rename',
					keyHint: null,
					label: `Rename...`,
					leftItem: null,
					onClick: () => {
						if (!composition) {
							return;
						}

						closeMenu();
						setSelectedModal({
							type: 'rename-comp',
							compositionId: composition.id,
						});
					},
					quickSwitcherLabel: 'Rename composition...',
					subMenu: null,
					type: 'item' as const,
					value: 'rename',
					disabled: !composition || readOnlyStudio,
				}
			: null,
		includeCompositionManagementItems
			? {
					id: 'duplicate',
					keyHint: null,
					label: `Duplicate...`,
					leftItem: null,
					onClick: () => {
						if (!composition) {
							return;
						}

						closeMenu();
						setSelectedModal({
							type: 'duplicate-comp',
							compositionId: composition.id,
							compositionType:
								composition.durationInFrames === 1 ? 'still' : 'composition',
						});
					},
					quickSwitcherLabel: 'Duplicate composition...',
					subMenu: null,
					type: 'item' as const,
					value: 'duplicate',
					disabled: !composition || readOnlyStudio,
				}
			: null,
		includeCompositionManagementItems
			? {
					id: 'delete',
					keyHint: null,
					label: `Delete...`,
					leftItem: null,
					onClick: () => {
						if (!composition) {
							return;
						}

						closeMenu();
						setSelectedModal({
							type: 'delete-comp',
							compositionId: composition.id,
						});
					},
					quickSwitcherLabel: 'Delete composition...',
					subMenu: null,
					type: 'item' as const,
					value: 'delete',
					disabled: !composition || readOnlyStudio,
				}
			: null,
		hasOpenInItems || includeCompositionManagementItems
			? {
					type: 'divider' as const,
					id: 'copy-actions-divider',
				}
			: null,
		{
			id: 'copy-context-for-agents',
			keyHint: null,
			label: `Copy context for agents`,
			leftItem: null,
			onClick: () => {
				closeMenu();
				if (!contextForAgents) {
					return;
				}

				navigator.clipboard.writeText(contextForAgents).catch((err) => {
					showNotification(
						`Could not copy to clipboard: ${(err as Error).message}`,
						1000,
					);
				});
			},
			quickSwitcherLabel: null,
			subMenu: null,
			type: 'item' as const,
			value: 'copy-context-for-agents',
			disabled: !contextForAgents,
		},
		{
			id: 'copy-file-location',
			keyHint: null,
			label: `Copy file location`,
			leftItem: null,
			onClick: () => {
				closeMenu();
				if (!fileLocation) {
					return;
				}

				navigator.clipboard
					.writeText(fileLocation)
					.then(() => {
						showNotification('Copied file location to clipboard', 1000);
					})
					.catch((err) => {
						showNotification(
							`Could not copy to clipboard: ${(err as Error).message}`,
							1000,
						);
					});
			},
			quickSwitcherLabel: 'Copy composition file location',
			subMenu: null,
			type: 'item' as const,
			value: 'copy-file-location',
			disabled: copyFileLocationDisabled,
		},
		{
			id: 'copy-id',
			keyHint: null,
			label: `Copy ID`,
			leftItem: null,
			onClick: () => {
				if (!composition) {
					return;
				}

				closeMenu();
				navigator.clipboard
					.writeText(composition.id)
					.then(() => {
						showNotification('Copied composition name', 1000);
					})
					.catch((err) => {
						showNotification(
							`Could not copy to clipboard: ${err.message}`,
							1000,
						);
					});
			},
			quickSwitcherLabel: 'Copy composition ID',
			subMenu: null,
			type: 'item' as const,
			value: 'copy-id',
			disabled: !composition,
		},
	].filter(NoReactInternals.truthy);
};

export const getCompositionContextMenuItems = (
	args: Omit<
		Parameters<typeof getCompositionMenuItems>[0],
		'includeCompositionManagementItems'
	> & {
		readonly includeCompositionManagementItems: boolean;
	},
): ComboboxValue[] => {
	if (args.composition === null) {
		return getCompositionMenuItems({
			...args,
		});
	}

	return [
		getOpenInNewWindowMenuItem(`/${args.composition.id}`),
		{
			type: 'divider',
			id: 'open-in-new-window-divider',
		},
		...getCompositionMenuItems({
			...args,
		}),
	];
};
