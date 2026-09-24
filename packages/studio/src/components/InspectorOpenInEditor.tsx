import type {DefaultCodingAgent} from '@remotion/renderer';
import type {EditorPickerId} from '@remotion/studio-shared';
import React, {useCallback, useContext, useMemo} from 'react';
import type {OriginalPosition} from '../error-overlay/react-overlay/utils/get-source-map';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {LIGHT_TEXT} from '../helpers/colors';
import {copyText} from '../helpers/copy-text';
import {
	getDefaultOpenInTarget,
	openGitSource,
} from '../helpers/get-git-menu-item';
import {
	openInCodingAgent,
	openInGitClient,
	openInTerminal,
	openOriginalPositionInEditor,
} from '../helpers/open-in-editor';
import {CaretDown} from '../icons/caret';
import {EditorIcon} from '../icons/editor';
import {GitHubIcon} from '../icons/github';
import {getOpenInMenuItems} from './get-open-in-menu-items';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {showNotification} from './Notifications/NotificationCenter';
import {openInFileExplorer} from './RenderQueue/actions';
import {SegmentedButton, type SegmentedButtonSegment} from './SegmentedButton';
import {useConfigureDefaultApps} from './use-configure-default-apps';
import {
	useDefaultCodingAgentInfo,
	useEditorOpening,
} from './use-default-editor-info';

const mainSegmentStyle: React.CSSProperties = {
	columnGap: 4,
	fontSize: 11,
	lineHeight: '14px',
	padding: '0 2px 0 4px',
};

const dropdownSegmentStyle: React.CSSProperties = {
	padding: 0,
	width: 20,
};

const editorButtonIconSize = 18;
const githubButtonIconSize = 16;

export const InspectorOpenInEditor: React.FC<{
	readonly contextForAgents?: string | null;
	readonly location: OriginalPosition | null;
	readonly label?: React.ReactNode;
	readonly locationType: 'file' | 'folder' | null;
	readonly showTooltips: boolean;
}> = ({
	contextForAgents = null,
	label,
	location,
	locationType,
	showTooltips,
}) => {
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const configureDefaultApps = useConfigureDefaultApps();
	const {
		canConfigureApps,
		canOpenInEditor,
		defaultEditorId,
		defaultEditorName,
		editorInfo,
	} = useEditorOpening(previewServerState.type === 'connected');
	const codingAgentInfo = useDefaultCodingAgentInfo(canConfigureApps);
	const defaultOpenInTarget = getDefaultOpenInTarget({canOpenInEditor});

	const openWithEditor = useCallback(
		async (editorId: EditorPickerId) => {
			if (!location) {
				return;
			}

			try {
				await openOriginalPositionInEditor(location, editorId);
			} catch (err) {
				showNotification((err as Error).message, 2000);
			}
		},
		[location],
	);

	const openWithCodingAgent = useCallback(
		async (codingAgentId: DefaultCodingAgent, codingAgentName: string) => {
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
		},
		[contextForAgents],
	);
	const copyPath = useCallback(() => {
		if (!location?.source) {
			return;
		}

		copyText(location.source)
			.then(() => showNotification('Copied path', 1500))
			.catch((err: Error) => {
				showNotification(`Could not copy path: ${err.message}`, 2000);
			});
	}, [location]);
	const defaultAppName =
		defaultOpenInTarget === 'git-source'
			? 'GitHub'
			: (defaultEditorName ?? 'default editor');
	const canOpenDefault = location !== null && defaultOpenInTarget !== null;
	const onOpenDefault: React.MouseEventHandler<HTMLButtonElement> = useCallback(
		(event) => {
			event.stopPropagation();
			if (defaultOpenInTarget === 'git-source') {
				openGitSource({folder: locationType === 'folder', location});
			} else if (defaultOpenInTarget === 'editor' && defaultEditorId) {
				openWithEditor(defaultEditorId).catch(() => undefined);
			}
		},
		[
			defaultEditorId,
			defaultOpenInTarget,
			location,
			locationType,
			openWithEditor,
		],
	);
	const menuItems = useMemo((): ComboboxValue[] => {
		const items = getOpenInMenuItems({
			canOpenDesktopApps: canConfigureApps,
			codingAgentInfo,
			editorDisabled: location === null || !canOpenInEditor,
			editorInfo,
			excludeCodingAgentId: null,
			excludeEditorId: defaultEditorId,
			excludeGitSource: defaultOpenInTarget === 'git-source',
			fileManagerDisabled:
				!location?.source || previewServerState.type !== 'connected',
			folder: locationType === 'folder',
			gitSourceDisabled: location === null,
			onConfigureApps: configureDefaultApps,
			onCopyPath:
				locationType === 'folder' && location?.source ? copyPath : undefined,
			onOpenInCodingAgent: (codingAgentId, codingAgentName) => {
				openWithCodingAgent(codingAgentId, codingAgentName).catch(
					() => undefined,
				);
			},
			onOpenInEditor: (editorId) => {
				openWithEditor(editorId).catch(() => undefined);
			},
			onOpenInFileExplorer: () => {
				if (!location?.source) {
					return;
				}

				openInFileExplorer({directory: location.source}).catch((err) => {
					showNotification(`Could not open file: ${err.message}`, 2000);
				});
			},
			onOpenInGitClient: (gitClientId) => {
				openInGitClient(gitClientId)
					.then((response) => {
						if (!response.success) {
							showNotification('Could not open Git client', 2000);
						}
					})
					.catch((err) => {
						showNotification(
							`Could not open Git client: ${(err as Error).message}`,
							2000,
						);
					});
			},
			onOpenInGitSource: () => {
				openGitSource({folder: locationType === 'folder', location});
			},
			onOpenInTerminal: (terminalId) => {
				if (!location?.source || locationType !== 'folder') {
					return;
				}

				openInTerminal(terminalId, location.source)
					.then((response) => {
						if (!response.success) {
							showNotification('Could not open terminal', 2000);
						}
					})
					.catch((err) => {
						showNotification(
							`Could not open terminal: ${(err as Error).message}`,
							2000,
						);
					});
			},
		});

		return items;
	}, [
		codingAgentInfo,
		canConfigureApps,
		canOpenInEditor,
		configureDefaultApps,
		copyPath,
		defaultEditorId,
		defaultOpenInTarget,
		editorInfo,
		location,
		locationType,
		openWithCodingAgent,
		openWithEditor,
		previewServerState.type,
	]);
	const segments = useMemo((): SegmentedButtonSegment[] => {
		const result: SegmentedButtonSegment[] = [
			{
				ariaLabel: `Open in ${defaultAppName}`,
				buttonId: null,
				disabled: !canOpenDefault,
				idleColor: LIGHT_TEXT,
				onClick: onOpenDefault,
				onPointerDown: null,
				renderContent: () => (
					<>
						{label}
						{defaultOpenInTarget === 'git-source' ? (
							<GitHubIcon size={githubButtonIconSize} />
						) : (
							<EditorIcon
								editorId={defaultEditorId}
								size={editorButtonIconSize}
							/>
						)}
					</>
				),
				segmentId: 'default-editor',
				style: mainSegmentStyle,
				title: showTooltips ? '' : `Open in ${defaultAppName}`,
				tooltipLabel: showTooltips ? `Open in ${defaultAppName}` : null,
				type: 'action',
			},
		];

		if (menuItems.length > 0) {
			result.push({
				ariaLabel: 'Open in another app',
				buttonId: null,
				disabled: false,
				idleColor: LIGHT_TEXT,
				leaveLeftSpace: true,
				onOpenChange: null,
				renderContent: (color) => <CaretDown color={color} />,
				segmentId: 'another-app',
				selectedId: null,
				style: dropdownSegmentStyle,
				title: showTooltips ? '' : 'Open in another app',
				tooltipLabel: showTooltips ? 'Open in another app' : null,
				type: 'menu',
				values: menuItems,
			});
		}

		return result;
	}, [
		canOpenDefault,
		defaultAppName,
		defaultEditorId,
		defaultOpenInTarget,
		label,
		menuItems,
		onOpenDefault,
		showTooltips,
	]);

	if (getBrowserStudioOperations() !== null) {
		return null;
	}

	if (previewServerState.type !== 'connected' && defaultOpenInTarget === null) {
		return null;
	}

	return <SegmentedButton segments={segments} style={null} title={null} />;
};
