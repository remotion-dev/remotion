import type {DefaultCodingAgent} from '@remotion/renderer';
import type {EditorPickerId} from '@remotion/studio-shared';
import React, {useCallback, useContext, useMemo} from 'react';
import type {OriginalPosition} from '../error-overlay/react-overlay/utils/get-source-map';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {LIGHT_TEXT} from '../helpers/colors';
import {
	hasReadOnlyGitSource,
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

export const InspectorOpenInEditor: React.FC<{
	readonly contextForAgents?: string | null;
	readonly location: OriginalPosition | null;
	readonly label?: React.ReactNode;
	readonly locationType: 'file' | 'folder' | null;
}> = ({contextForAgents = null, label, location, locationType}) => {
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
	const canOpenInGitHub = hasReadOnlyGitSource();
	const defaultActionIsGitHub = !canOpenInEditor && canOpenInGitHub;

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
	const defaultAppName = defaultActionIsGitHub
		? 'GitHub'
		: (defaultEditorName ?? 'default editor');
	const canOpenDefault =
		location !== null && (canOpenInEditor || canOpenInGitHub);
	const onOpenDefault: React.MouseEventHandler<HTMLButtonElement> = useCallback(
		(event) => {
			event.stopPropagation();
			if (defaultActionIsGitHub) {
				openGitSource({folder: locationType === 'folder', location});
			} else if (defaultEditorId) {
				openWithEditor(defaultEditorId).catch(() => undefined);
			}
		},
		[
			defaultActionIsGitHub,
			defaultEditorId,
			location,
			locationType,
			openWithEditor,
		],
	);
	const menuItems = useMemo((): ComboboxValue[] => {
		const items = getOpenInMenuItems({
			codingAgentInfo,
			editorDisabled: location === null || !canOpenInEditor,
			editorInfo,
			excludeCodingAgentId: null,
			excludeEditorId: defaultEditorId,
			fileManagerDisabled:
				!location?.source || previewServerState.type !== 'connected',
			folder: locationType === 'folder',
			location,
			onConfigureApps: configureDefaultApps,
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

		return defaultActionIsGitHub
			? items.filter((item) => item.id !== 'open-in-github')
			: items;
	}, [
		codingAgentInfo,
		canOpenInEditor,
		configureDefaultApps,
		defaultActionIsGitHub,
		defaultEditorId,
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
						{defaultActionIsGitHub ? (
							<GitHubIcon size={editorButtonIconSize} />
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
				title: `Open in ${defaultAppName}`,
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
				title: 'Open in another app',
				type: 'menu',
				values: menuItems,
			});
		}

		return result;
	}, [
		canOpenDefault,
		defaultActionIsGitHub,
		defaultAppName,
		defaultEditorId,
		label,
		menuItems,
		onOpenDefault,
	]);

	if (getBrowserStudioOperations() !== null) {
		return null;
	}

	if (previewServerState.type !== 'connected' && !canOpenInGitHub) {
		return null;
	}

	return <SegmentedButton segments={segments} style={null} title={null} />;
};
