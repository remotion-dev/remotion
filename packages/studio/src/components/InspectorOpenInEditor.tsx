import type {DefaultCodingAgent} from '@remotion/renderer';
import type {EditorPickerId} from '@remotion/studio-shared';
import React, {useCallback, useContext, useMemo, useRef, useState} from 'react';
import type {OriginalPosition} from '../error-overlay/react-overlay/utils/get-source-map';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {
	LIGHT_TEXT,
	TRANSPARENT,
	WHITE,
	getBackgroundFromHoverState,
} from '../helpers/colors';
import {
	openInCodingAgent,
	openInGitClient,
	openInTerminal,
	openOriginalPositionInEditor,
} from '../helpers/open-in-editor';
import {CaretDown} from '../icons/caret';
import {EditorIcon} from '../icons/editor';
import {SetSelectedModalContext} from '../state/modals';
import {useZIndex} from '../state/z-index';
import {getOpenInMenuItems} from './get-open-in-menu-items';
import type {RenderInlineAction} from './InlineAction';
import {InlineDropdown} from './InlineDropdown';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {showNotification} from './Notifications/NotificationCenter';
import {openInFileExplorer} from './RenderQueue/actions';
import {
	useDefaultCodingAgentInfo,
	useEditorOpening,
} from './use-default-editor-info';

const splitButton: React.CSSProperties = {
	alignItems: 'center',
	borderRadius: 3,
	display: 'inline-flex',
	flexDirection: 'row',
	flexShrink: 0,
	gap: 1,
	height: 24,
	overflow: 'hidden',
};

const mainButtonBase: React.CSSProperties = {
	alignItems: 'center',
	background: TRANSPARENT,
	border: 'none',
	borderRadius: '3px 0 0 3px',
	color: LIGHT_TEXT,
	columnGap: 4,
	display: 'inline-flex',
	fontFamily: 'sans-serif',
	fontSize: 11,
	height: 24,
	lineHeight: '14px',
	padding: '0 6px',
	whiteSpace: 'nowrap',
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
	const {tabIndex} = useZIndex();
	const [hovered, setHovered] = useState(false);
	const [dropdownOpened, setDropdownOpened] = useState(false);
	const ignorePointerEnter = useRef(false);
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
	const onDropdownOpenChange = useCallback((open: boolean) => {
		setDropdownOpened(open);
		if (!open) {
			ignorePointerEnter.current = true;
			setHovered(false);
		}
	}, []);
	const mainHovered = hovered && !dropdownOpened;
	const mainButtonStyle = useMemo((): React.CSSProperties => {
		return {
			...mainButtonBase,
			background: getBackgroundFromHoverState({
				hovered: mainHovered,
				selected: false,
			}),
			color: mainHovered ? WHITE : LIGHT_TEXT,
			opacity: canOpenDefault ? 1 : 0.5,
			pointerEvents: canOpenDefault ? 'auto' : 'none',
		};
	}, [canOpenDefault, mainHovered]);
	const dropdownForegroundColor =
		hovered || dropdownOpened ? WHITE : LIGHT_TEXT;
	const dropdownStyle = useMemo((): React.CSSProperties => {
		return {
			background: getBackgroundFromHoverState({
				hovered,
				selected: dropdownOpened,
			}),
			borderRadius: '0 3px 3px 0',
			color: dropdownForegroundColor,
		};
	}, [dropdownForegroundColor, dropdownOpened, hovered]);
	const renderDropdownAction: RenderInlineAction = useCallback((color) => {
		return <CaretDown color={color} small />;
	}, []);
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

	if (
		previewServerState.type !== 'connected' ||
		getBrowserStudioOperations() !== null
	) {
		return null;
	}

	return (
		<div
			style={splitButton}
			onPointerEnter={() => {
				if (!ignorePointerEnter.current) {
					setHovered(true);
				}
			}}
			onPointerLeave={() => {
				ignorePointerEnter.current = false;
				setHovered(false);
			}}
		>
			<button
				aria-label={`Open in ${editorName}`}
				disabled={!canOpenDefault}
				onClick={onOpenDefault}
				style={mainButtonStyle}
				tabIndex={tabIndex}
				title={`Open in ${editorName}`}
				type="button"
			>
				{label}
				<EditorIcon editorId={defaultEditorId} size={editorButtonIconSize} />
			</button>
			<InlineDropdown
				onOpenChange={onDropdownOpenChange}
				renderAction={renderDropdownAction}
				style={dropdownStyle}
				title="Open in another app"
				unhoveredColor={dropdownForegroundColor}
				values={menuItems}
				variant="compact"
			/>
		</div>
	);
};
