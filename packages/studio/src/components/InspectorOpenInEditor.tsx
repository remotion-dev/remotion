import type {DefaultCodingAgent} from '@remotion/renderer';
import type {EditorPickerId} from '@remotion/studio-shared';
import React, {useCallback, useContext, useMemo} from 'react';
import type {OriginalPosition} from '../error-overlay/react-overlay/utils/get-source-map';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {LIGHT_TEXT} from '../helpers/colors';
import {
	openInCodingAgent,
	openInGitClient,
	openInTerminal,
	openOriginalPositionInEditor,
} from '../helpers/open-in-editor';
import {CaretDown} from '../icons/caret';
import {EditorIcon} from '../icons/editor';
import {SetSelectedModalContext} from '../state/modals';
import {getOpenInMenuItems} from './get-open-in-menu-items';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {showNotification} from './Notifications/NotificationCenter';
import {openInFileExplorer} from './RenderQueue/actions';
import {SegmentedButton, type SegmentedButtonSegment} from './SegmentedButton';
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
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const {
		canConfigureApps,
		canOpenInEditor,
		defaultEditorId,
		defaultEditorName,
		editorInfo,
	} = useEditorOpening(previewServerState.type === 'connected');
	const codingAgentInfo = useDefaultCodingAgentInfo(canConfigureApps);

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
	const editorName = defaultEditorName ?? 'default editor';
	const canOpenDefault = location !== null && canOpenInEditor;
	const onOpenDefault: React.MouseEventHandler<HTMLButtonElement> = useCallback(
		(event) => {
			event.stopPropagation();
			if (defaultEditorId) {
				openWithEditor(defaultEditorId).catch(() => undefined);
			}
		},
		[defaultEditorId, openWithEditor],
	);
	const menuItems = useMemo((): ComboboxValue[] => {
		return getOpenInMenuItems({
			codingAgentInfo,
			editorDisabled: location === null,
			editorInfo,
			excludeCodingAgentId: null,
			excludeEditorId: defaultEditorId,
			fileManagerDisabled: !location?.source,
			folder: locationType === 'folder',
			location,
			onConfigureApps: canConfigureApps
				? () => {
						setSelectedModal({
							type: 'settings',
							initialTab: 'apps',
							initialPublicLicenseKey:
								window.remotion_renderDefaults?.publicLicenseKey ?? null,
						});
					}
				: null,
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
	}, [
		codingAgentInfo,
		canConfigureApps,
		defaultEditorId,
		editorInfo,
		location,
		locationType,
		openWithCodingAgent,
		openWithEditor,
		setSelectedModal,
	]);
	const segments = useMemo((): SegmentedButtonSegment[] => {
		return [
			{
				ariaLabel: `Open in ${editorName}`,
				buttonId: null,
				disabled: !canOpenDefault,
				idleColor: LIGHT_TEXT,
				onClick: onOpenDefault,
				onPointerDown: null,
				renderContent: () => (
					<>
						{label}
						<EditorIcon
							editorId={defaultEditorId}
							size={editorButtonIconSize}
						/>
					</>
				),
				segmentId: 'default-editor',
				style: mainSegmentStyle,
				title: `Open in ${editorName}`,
				type: 'action',
			},
			{
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
			},
		];
	}, [
		canOpenDefault,
		defaultEditorId,
		editorName,
		label,
		menuItems,
		onOpenDefault,
	]);

	if (
		previewServerState.type !== 'connected' ||
		getBrowserStudioOperations() !== null
	) {
		return null;
	}

	return <SegmentedButton segments={segments} style={null} title={null} />;
};
