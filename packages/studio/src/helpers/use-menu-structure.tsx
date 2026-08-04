import {useContext, useEffect, useMemo} from 'react';
import {Internals} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {restartStudio} from '../api/restart-studio';
import {askAiModalRef} from '../components/AskAiModal';
import {getCompositionMenuItems} from '../components/composition-menu-items';
import {Row} from '../components/layout';
import type {Menu} from '../components/Menu/MenuItem';
import type {
	ComboboxValue,
	SelectionItem,
} from '../components/NewComposition/ComboBox';
import {showNotification} from '../components/Notifications/NotificationCenter';
import type {TQuickSwitcherResult} from '../components/QuickSwitcher/QuickSwitcherResult';
import {openInFileExplorer} from '../components/RenderQueue/actions';
import {getPreviewSizeLabel, getUniqueSizes} from '../components/SizeSelector';
import {useResolvedStack} from '../components/Timeline/use-resolved-stack';
import {inOutHandles} from '../components/TimelineInOutToggle';
import {cmdOrCtrlCharacter} from '../error-overlay/remotion-overlay/ShortcutHint';
import {Checkmark} from '../icons/Checkmark';
import {drawRef} from '../state/canvas-ref';
import {CheckerboardContext} from '../state/checkerboard';
import {EditorShowGuidesContext} from '../state/editor-guides';
import {EditorShowRulersContext} from '../state/editor-rulers';
import {EditorSnappingContext} from '../state/editor-snapping';
import {EditorZoomGesturesContext} from '../state/editor-zoom-gestures';
import type {ModalState} from '../state/modals';
import {SetSelectedModalContext} from '../state/modals';
import type {SidebarCollapsedState} from '../state/sidebar';
import {SidebarContext} from '../state/sidebar';
import {getBrowserStudioOperations} from './browser-studio-operations';
import {checkFullscreenSupport} from './check-fullscreen-support';
import {StudioServerConnectionCtx} from './client-id';
import {CURRENT_COLOR} from './colors';
import {downloadBlob} from './download-blob';
import {getFileManagerName} from './get-file-manager-name';
import {getGitMenuItem} from './get-git-menu-item';
import {useMobileLayout} from './mobile-layout';
import {openInEditor, preloadCompositionComponentInfo} from './open-in-editor';
import {pickColor} from './pick-color';
import {getStudioAskAIEnabled} from './studio-runtime-config';
import {areKeyboardShortcutsDisabled} from './use-keybinding';

type Structure = Menu[];

const openExternal = (link: string) => {
	window.open(link, '_blank');
};

const inheritColor: React.CSSProperties = {
	color: 'inherit',
};
const ICON_SIZE = 14;

const getFileMenu = ({
	readOnlyStudio,
	closeMenu,
	editorName,
	previewServerState,
	setSelectedModal,
}: {
	readOnlyStudio: boolean;
	closeMenu: () => void;
	editorName: string | null;
	previewServerState: 'connected' | 'init' | 'disconnected';
	setSelectedModal: (value: React.SetStateAction<ModalState | null>) => void;
}) => {
	const fileManagerName = getFileManagerName(
		window.remotion_fileSystemPlatform,
	);
	const browserStudioOperations = getBrowserStudioOperations();
	const downloadProject = browserStudioOperations?.downloadProject;
	const items: ComboboxValue[] = [
		readOnlyStudio
			? null
			: {
					id: 'new-composition',
					value: 'new-composition',
					label: 'New composition...',
					onClick: () => {
						closeMenu();
						setSelectedModal({
							type: 'new-comp',
							folderName: null,
							parentName: null,
							stack: null,
						});
					},
					type: 'item' as const,
					keyHint: null,
					leftItem: null,
					subMenu: null,
					quickSwitcherLabel: 'New composition...',
					disabled: previewServerState !== 'connected',
				},
		readOnlyStudio
			? null
			: {
					id: 'new-folder',
					value: 'new-folder',
					label: 'New folder...',
					onClick: () => {
						closeMenu();
						setSelectedModal({
							type: 'new-folder',
							parentName: null,
							stack: null,
						});
					},
					type: 'item' as const,
					keyHint: null,
					leftItem: null,
					subMenu: null,
					quickSwitcherLabel: 'New folder...',
					disabled: previewServerState !== 'connected',
				},
		readOnlyStudio
			? null
			: {
					type: 'divider' as const,
					id: 'new-project-item-divider',
				},
		window.remotion_isReadOnlyStudio
			? {
					id: 'input-props-override',
					value: 'input-props-override',
					label: 'Set input props...',
					onClick: () => {
						closeMenu();
						setSelectedModal({
							type: 'input-props-override',
						});
					},
					type: 'item' as const,
					keyHint: null,
					leftItem: null,
					subMenu: null,
					quickSwitcherLabel: 'Override input props',
				}
			: null,
		downloadProject
			? {
					id: 'download-project',
					value: 'download-project',
					label: 'Download project',
					onClick: async () => {
						closeMenu();

						try {
							const {data, fileName} = await downloadProject();
							const arrayBuffer = data.buffer.slice(
								data.byteOffset,
								data.byteOffset + data.byteLength,
							) as ArrayBuffer;
							downloadBlob(
								new Blob([arrayBuffer], {type: 'application/zip'}),
								fileName,
							);
						} catch (error) {
							showNotification(
								`Could not download project: ${
									error instanceof Error ? error.message : String(error)
								}`,
								2000,
							);
						}
					},
					type: 'item' as const,
					keyHint: null,
					leftItem: null,
					subMenu: null,
					quickSwitcherLabel: 'Download project',
				}
			: null,
		!readOnlyStudio && downloadProject
			? {
					type: 'divider' as const,
					id: 'open-project-divider',
				}
			: null,
		editorName && !readOnlyStudio
			? {
					id: 'open-in-editor',
					value: 'open-in-editor',
					label: `Open in ${editorName}`,
					onClick: async () => {
						await openInEditor(
							{
								originalFileName: `${window.remotion_cwd}`,
								originalLineNumber: 1,
								originalColumnNumber: 1,
								originalFunctionName: null,
								originalScriptCode: null,
							},
							null,
						)
							.then(({success}) => {
								if (!success) {
									showNotification(`Could not open ${editorName}`, 2000);
								}
							})
							.catch((err) => {
								// eslint-disable-next-line no-console
								console.error(err);
								showNotification(`Could not open ${editorName}`, 2000);
							});
					},
					type: 'item' as const,
					keyHint: null,
					leftItem: null,
					subMenu: null,
					quickSwitcherLabel: 'Open in editor...',
					disabled: previewServerState !== 'connected',
				}
			: null,
		!readOnlyStudio
			? {
					id: 'open-project-in-explorer',
					value: 'open-project-in-explorer',
					label: `Open in ${fileManagerName}`,
					onClick: () => {
						closeMenu();
						openInFileExplorer({directory: window.remotion_cwd}).catch(
							(err) => {
								showNotification(
									`Could not open project: ${err.message}`,
									2000,
								);
							},
						);
					},
					type: 'item' as const,
					keyHint: null,
					leftItem: null,
					subMenu: null,
					quickSwitcherLabel: `Open project in ${fileManagerName}`,
					disabled: previewServerState !== 'connected',
				}
			: null,

		getGitMenuItem(),
	].filter(NoReactInternals.truthy);
	if (items.length === 0) {
		return null;
	}

	return {
		id: 'file' as const,
		label: 'File',
		leaveLeftPadding: false,
		items,
		quickSwitcherLabel: null,
	};
};

const getRenderMenuItems = ({
	closeMenu,
	previewServerState,
	readOnlyStudio,
}: {
	closeMenu: () => void;
	previewServerState: 'connected' | 'init' | 'disconnected';
	readOnlyStudio: boolean;
}): ComboboxValue[] => {
	return [
		readOnlyStudio
			? null
			: {
					id: 'render',
					value: 'render',
					label: 'Render...',
					onClick: () => {
						closeMenu();
						if (previewServerState !== 'connected') {
							showNotification('Restart the studio to render', 2000);
							return;
						}

						const renderButton = document.getElementById(
							'render-modal-button-server',
						) as HTMLButtonElement;

						renderButton.click();
					},
					type: 'item' as const,
					keyHint: 'R',
					leftItem: null,
					subMenu: null,
					quickSwitcherLabel: 'Render...',
				},
		{
			id: 'render-on-web',
			value: 'render-on-web',
			label: 'Render on web...',
			onClick: () => {
				closeMenu();

				const renderButton = document.getElementById(
					'render-modal-button-client',
				) as HTMLButtonElement;

				renderButton.click();
			},
			type: 'item' as const,
			keyHint: null,
			leftItem: null,
			subMenu: null,
			quickSwitcherLabel: 'Render on web...',
		},
		{
			type: 'divider' as const,
			id: 'render-divider',
		},
	].filter(NoReactInternals.truthy);
};

export const useMenuStructure = (
	closeMenu: () => void,
	readOnlyStudio: boolean,
) => {
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const {checkerboard, setCheckerboard} = useContext(CheckerboardContext);
	const {editorZoomGestures, setEditorZoomGestures} = useContext(
		EditorZoomGesturesContext,
	);
	const {editorShowRulers, setEditorShowRulers} = useContext(
		EditorShowRulersContext,
	);
	const {editorShowGuides, setEditorShowGuides} = useContext(
		EditorShowGuidesContext,
	);
	const {editorSnapping, setEditorSnapping} = useContext(EditorSnappingContext);
	const {size, setSize} = useContext(Internals.PreviewSizeContext);
	const {canvasContent, compositions} = useContext(
		Internals.CompositionManager,
	);
	const {type} = useContext(StudioServerConnectionCtx).previewServerState;
	const editorName = window.remotion_editorName;
	const keyboardShortcutsDisabled = areKeyboardShortcutsDisabled();
	const studioAskAIEnabled = getStudioAskAIEnabled();
	const canConfigureDefaultEditor =
		!readOnlyStudio &&
		type === 'connected' &&
		getBrowserStudioOperations() === null;

	const {
		setSidebarCollapsedState,
		sidebarCollapsedStateLeft,
		sidebarCollapsedStateRight,
	} = useContext(SidebarContext);
	const sizes = useMemo(() => getUniqueSizes(size), [size]);

	const isFullscreenSupported = checkFullscreenSupport();

	const {remotion_packageManager} = window;

	const sizePreselectIndex = sizes.findIndex(
		(s) => String(size.size) === String(s.size),
	);

	const mobileLayout = useMobileLayout();
	const currentComposition = useMemo(() => {
		if (canvasContent === null || canvasContent.type !== 'composition') {
			return null;
		}

		return (
			compositions.find((c) => c.id === canvasContent.compositionId) ?? null
		);
	}, [canvasContent, compositions]);
	const resolvedCompositionLocation = useResolvedStack(
		currentComposition?.stack ?? null,
	);

	useEffect(() => {
		if (
			type !== 'connected' ||
			!currentComposition ||
			!resolvedCompositionLocation?.source
		) {
			return;
		}

		preloadCompositionComponentInfo({
			compositionFile: resolvedCompositionLocation.source,
			compositionId: currentComposition.id,
		});
	}, [currentComposition, resolvedCompositionLocation?.source, type]);

	const structure = useMemo((): Structure => {
		let struct: Structure = [
			{
				id: 'remotion' as const,
				label: (
					<Row align="center" justify="center" style={inheritColor}>
						<svg
							width={ICON_SIZE}
							height={ICON_SIZE}
							viewBox="0 0 415 426"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
							style={inheritColor}
						>
							<path
								d="M93.4691 0.0367432C84.4873 0.520935 77.2494 1.93634 69.9553 4.69266C66.3176 6.05219 60.3548 9.0134 57.0734 11.062C43.3476 19.6103 32.8846 32.4606 27.428 47.4154C26.3405 50.3766 23.3966 59.8188 21.5027 66.3185C8.88329 109.768 1.7204 157.277 0.182822 207.561C-0.0609408 215.569 -0.0609408 234.639 0.182822 242.517C1.21413 275.854 4.42055 305.949 10.2334 336.641C12.596 349.063 16.3837 365.75 18.5776 373.33C23.059 388.732 32.2095 401.843 45.2227 411.453C53.9419 417.896 63.8425 422.217 74.8118 424.34C80.0996 425.365 87.075 425.83 92.2127 425.495C99.3194 425.029 113.42 423.148 124.877 421.118C176.517 411.974 224.22 395.604 267.478 372.175C294.874 357.332 318.294 341.26 340.888 321.761C363.408 302.355 382.609 281.478 399.504 258.049C403.423 252.63 405.392 249.464 407.361 245.478C412.424 235.198 414.805 224.974 414.786 213.539C414.786 202.886 412.761 193.425 408.392 183.741C406.292 179.066 404.286 175.714 399.785 169.345C383.21 145.898 364.815 125.467 342.389 105.614C307.624 74.8481 266.335 49.613 220.226 30.9334C210.232 26.8921 200.387 23.335 188.537 19.4799C163.448 11.3413 132.396 4.28293 106.126 0.763062C102.001 0.204346 96.3942 -0.112244 93.4691 0.0367432Z"
								fill={CURRENT_COLOR}
								style={inheritColor}
							/>
						</svg>
					</Row>
				),
				leaveLeftPadding: false,
				items: [
					{
						id: 'about',
						value: 'about',
						label: 'About Remotion',
						onClick: () => {
							closeMenu();
							openExternal('https://remotion.dev');
						},
						type: 'item' as const,
						keyHint: null,
						leftItem: null,
						subMenu: null,
						quickSwitcherLabel: 'Help: About Remotion',
					},
					{
						id: 'changelog',
						value: 'changelog',
						label: 'Changelog',
						onClick: () => {
							closeMenu();
							openExternal('https://github.com/remotion-dev/remotion/releases');
						},
						type: 'item' as const,
						keyHint: null,
						leftItem: null,
						subMenu: null,
						quickSwitcherLabel: 'Help: Changelog',
					},
					{
						id: 'settings',
						value: 'settings',
						label: 'Settings...',
						onClick: () => {
							closeMenu();
							setSelectedModal({
								type: 'settings',
								initialTab: canConfigureDefaultEditor ? 'apps' : 'license',
								initialPublicLicenseKey:
									window.remotion_renderDefaults?.publicLicenseKey ?? null,
							});
						},
						type: 'item' as const,
						keyHint: null,
						leftItem: null,
						subMenu: null,
						quickSwitcherLabel: 'Settings...',
						disabled: readOnlyStudio || type !== 'connected',
					},
					{
						id: 'acknowledgements',
						value: 'acknowledgements',
						label: 'Acknowledgements',
						onClick: () => {
							closeMenu();
							openExternal('https://remotion.dev/acknowledgements');
						},
						type: 'item' as const,
						keyHint: null,
						leftItem: null,
						subMenu: null,
						quickSwitcherLabel: 'Help: Acknowledgements',
					},
					{
						type: 'divider' as const,
						id: 'timeline-divider-1',
					},
					{
						id: 'restart-studio',
						value: 'restart-studio',
						label: 'Restart Studio Server',
						onClick: () => {
							closeMenu();
							restartStudio();
						},
						type: 'item' as const,
						keyHint: null,
						leftItem: null,
						subMenu: null,
						quickSwitcherLabel: 'Restart Studio Server',
					},
				].filter(NoReactInternals.truthy),
				quickSwitcherLabel: null,
			},
			getFileMenu({
				readOnlyStudio,
				closeMenu,
				editorName,
				previewServerState: type,
				setSelectedModal,
			}),
			{
				id: 'view' as const,
				label: 'View',
				leaveLeftPadding: true,
				items: [
					{
						id: 'preview-size',
						keyHint: null,
						label: 'Preview size',
						onClick: () => undefined,
						type: 'item' as const,
						value: 'preview-size',
						leftItem: null,
						subMenu: {
							leaveLeftSpace: true,
							preselectIndex: sizePreselectIndex,
							items: sizes.map((newSize) => ({
								id: String(newSize.size),
								keyHint: newSize.size === 1 ? '0' : null,
								label: getPreviewSizeLabel(newSize),
								leftItem:
									String(newSize.size) === String(size.size) ? (
										<Checkmark />
									) : null,
								onClick: () => {
									closeMenu();
									setSize(() => newSize);
								},
								subMenu: null,
								type: 'item' as const,
								value: newSize.size,
								quickSwitcherLabel: null,
							})),
							quickSwitcherLabel: null,
						},
						quickSwitcherLabel: null,
					},
					{
						id: 'editor-zoom-gestures',
						keyHint: null,
						label: 'Zoom and Pan Gestures',
						onClick: () => {
							closeMenu();
							setEditorZoomGestures((c) => !c);
						},
						type: 'item' as const,
						value: 'editor-zoom-gestures',
						leftItem: editorZoomGestures ? <Checkmark /> : null,
						subMenu: null,
						quickSwitcherLabel: editorZoomGestures
							? 'Disable Zoom and Pan Gestures'
							: 'Enable Zoom and Pan Gestures',
					},
					{
						id: 'show-rulers',
						keyHint: null,
						label: 'Show Rulers',
						onClick: () => {
							closeMenu();
							setEditorShowRulers((c) => !c);
						},
						type: 'item' as const,
						value: 'show-ruler',
						leftItem: editorShowRulers ? <Checkmark /> : null,
						subMenu: null,
						quickSwitcherLabel: editorShowRulers
							? 'Hide Rulers'
							: 'Show Rulers',
					},
					{
						id: 'show-guides',
						keyHint: null,
						label: 'Show Guides',
						onClick: () => {
							closeMenu();
							setEditorShowGuides((c) => !c);
						},
						type: 'item' as const,
						value: 'show-guides',
						leftItem: editorShowGuides ? <Checkmark /> : null,
						subMenu: null,
						quickSwitcherLabel: editorShowGuides
							? 'Hide Guides'
							: 'Show Guides',
					},
					{
						id: 'enable-snapping',
						keyHint: keyboardShortcutsDisabled ? null : 'Shift+M',
						label: 'Enable Snapping',
						onClick: () => {
							closeMenu();
							setEditorSnapping((c) => !c);
						},
						type: 'item' as const,
						value: 'enable-snapping',
						leftItem: editorSnapping ? <Checkmark /> : null,
						subMenu: null,
						quickSwitcherLabel: editorSnapping
							? 'Disable Snapping'
							: 'Enable Snapping',
					},
					{
						id: 'timeline-divider-1',
						type: 'divider' as const,
					},
					{
						id: 'left-sidebar',
						label: 'Left Sidebar',
						keyHint: null,
						type: 'item' as const,
						value: 'preview-size',
						leftItem: null,
						quickSwitcherLabel: null,
						subMenu: {
							leaveLeftSpace: true,
							preselectIndex: 0,
							items: [
								{
									id: 'left-sidebar-responsive',
									keyHint: null,
									label: 'Responsive',
									leftItem:
										sidebarCollapsedStateLeft === 'responsive' ? (
											<Checkmark />
										) : null,
									onClick: () => {
										closeMenu();
										setSidebarCollapsedState({
											left: 'responsive',
											right: null,
										});
									},
									subMenu: null,
									type: 'item' as const,
									value: 'responsive' as SidebarCollapsedState,
									quickSwitcherLabel: null,
								},
								{
									id: 'left-sidebar-expanded',
									keyHint: null,
									label: 'Expanded',
									leftItem:
										sidebarCollapsedStateLeft === 'expanded' ? (
											<Checkmark />
										) : null,
									onClick: () => {
										closeMenu();
										setSidebarCollapsedState({left: 'expanded', right: null});
									},
									subMenu: null,
									type: 'item' as const,
									value: 'expanded' as SidebarCollapsedState,
									quickSwitcherLabel: 'Expand',
								},
								{
									id: 'left-sidebar-collapsed',
									keyHint: null,
									label: 'Collapsed',
									leftItem:
										sidebarCollapsedStateLeft === 'collapsed' ? (
											<Checkmark />
										) : null,
									onClick: () => {
										closeMenu();
										setSidebarCollapsedState({
											left: 'collapsed',
											right: null,
										});
									},
									subMenu: null,
									type: 'item' as const,
									value: 'collapsed' as SidebarCollapsedState,
									quickSwitcherLabel: 'Collapse',
								},
							],
						},
						onClick: () => undefined,
					},
					{
						id: 'right-sidebar',
						label: 'Right Sidebar',
						keyHint: null,
						type: 'item' as const,
						value: 'preview-size',
						leftItem: null,
						quickSwitcherLabel: null,
						subMenu: {
							leaveLeftSpace: true,
							preselectIndex: 0,
							items: [
								{
									id: 'sidebar-expanded',
									keyHint: null,
									label: 'Expanded',
									leftItem:
										sidebarCollapsedStateRight === 'expanded' ? (
											<Checkmark />
										) : null,
									onClick: () => {
										closeMenu();
										setSidebarCollapsedState({left: null, right: 'expanded'});
									},
									subMenu: null,
									type: 'item' as const,
									value: 'expanded' as SidebarCollapsedState,
									quickSwitcherLabel: 'Expand',
								},
								{
									id: 'right-sidebar-collapsed',
									keyHint: null,
									label: 'Collapsed',
									leftItem:
										sidebarCollapsedStateRight === 'collapsed' ? (
											<Checkmark />
										) : null,
									onClick: () => {
										closeMenu();
										setSidebarCollapsedState({
											left: null,
											right: 'collapsed',
										});
									},
									subMenu: null,
									type: 'item' as const,
									value: 'collapsed' as SidebarCollapsedState,
									quickSwitcherLabel: 'Collapse',
								},
							],
						},
						onClick: () => undefined,
					},
					{
						id: 'timeline-divider-2',
						type: 'divider' as const,
					},
					{
						id: 'checkerboard',
						keyHint: 'T',
						label: 'Transparency as checkerboard',
						onClick: () => {
							closeMenu();
							setCheckerboard((c) => !c);
						},
						type: 'item' as const,
						value: 'checkerboard',
						leftItem: checkerboard ? <Checkmark /> : null,
						subMenu: null,
						quickSwitcherLabel: checkerboard
							? 'Disable Checkerboard Transparency'
							: 'Enable Checkerboard Transparency',
					},
					{
						id: 'timeline-divider-3',
						type: 'divider' as const,
					},
					{
						id: 'quick-switcher',
						keyHint: `${cmdOrCtrlCharacter}+K`,
						label: 'Quick Switcher',
						onClick: () => {
							closeMenu();
							setSelectedModal({
								type: 'quick-switcher',
								mode: 'compositions',
								invocationTimestamp: Date.now(),
								assetSelection: null,
								compositionSelection: null,
							});
						},
						type: 'item' as const,
						value: 'quick-switcher',
						leftItem: null,
						subMenu: null,
						quickSwitcherLabel: 'Switch composition',
					},
					{
						id: 'in-out-divider-5',
						type: 'divider' as const,
					},
					{
						id: 'in-mark',
						keyHint: 'I',
						label: 'In Mark',
						leftItem: null,
						onClick: () => {
							closeMenu();
							inOutHandles.current?.inMarkClick(null);
						},
						subMenu: null,
						type: 'item' as const,
						value: 'in-mark',
						quickSwitcherLabel: 'Timeline: Set In Mark',
					},
					{
						id: 'out-mark',
						keyHint: 'O',
						label: 'Out Mark',
						leftItem: null,
						onClick: () => {
							closeMenu();
							inOutHandles.current?.outMarkClick(null);
						},
						subMenu: null,
						type: 'item' as const,
						value: 'out-mark',
						quickSwitcherLabel: 'Timeline: Set Out Mark',
					},
					{
						id: 'x-mark',
						keyHint: 'X',
						label: 'Clear In/Out Marks',
						leftItem: null,
						onClick: () => {
							closeMenu();
							inOutHandles.current?.clearMarks();
						},
						subMenu: null,
						type: 'item' as const,
						value: 'clear-marks',
						quickSwitcherLabel: 'Timeline: Clear In and Out Mark',
					},
					{
						id: 'goto-time',
						keyHint: 'G',
						label: 'Go to frame',
						leftItem: null,
						onClick: () => {
							closeMenu();
							Internals.timeValueRef.current?.goToFrame();
						},
						subMenu: null,
						type: 'item' as const,
						value: 'clear-marks',
						quickSwitcherLabel: 'Timeline: Go to frame',
					},
					{
						id: 'fullscreen-divider',
						type: 'divider' as const,
					},
					isFullscreenSupported
						? {
								id: 'fullscreen',
								keyHint: null,
								label: 'Fullscreen',
								leftItem: null,
								onClick: () => {
									closeMenu();
									drawRef.current?.requestFullscreen();
								},
								subMenu: null,
								type: 'item' as const,
								value: 'fullscreen',
								quickSwitcherLabel: 'Go Fullscreen',
							}
						: null,
				].filter(Internals.truthy),
			},
			{
				id: 'composition' as const,
				label: 'Composition',
				leaveLeftPadding: false,
				items: [
					...getRenderMenuItems({
						closeMenu,
						previewServerState: type,
						readOnlyStudio,
					}),
					...getCompositionMenuItems({
						closeMenu,
						composition: currentComposition,
						connectionStatus: type,
						includeCompositionManagementItems: true,
						resolvedLocation: resolvedCompositionLocation,
						setSelectedModal,
						readOnlyStudio,
					}),
				],
				quickSwitcherLabel: null,
			},
			{
				id: 'tools' as const,
				label: 'Tools',
				leaveLeftPadding: false,
				items: [
					studioAskAIEnabled
						? {
								id: 'ask-ai',
								value: 'ask-ai',
								label: 'Ask AI',
								onClick: () => {
									closeMenu();
									askAiModalRef.current?.toggle();
								},
								leftItem: null,
								keyHint: `${cmdOrCtrlCharacter}+I`,
								subMenu: null,
								type: 'item' as const,
								quickSwitcherLabel: 'Ask AI',
							}
						: null,
					'EyeDropper' in window
						? {
								id: 'color-picker',
								value: 'color-picker',
								label: 'Color Picker',
								onClick: () => {
									closeMenu();
									pickColor();
								},
								leftItem: null,
								keyHint: null,
								subMenu: null,
								type: 'item' as const,
								quickSwitcherLabel: 'Show Color Picker',
							}
						: null,
					readOnlyStudio || remotion_packageManager === 'unknown'
						? null
						: {
								id: 'install-packages',
								value: 'install-packages',
								label: 'Install package...',
								onClick: () => {
									closeMenu();
									setSelectedModal({
										type: 'install-packages',
										packageManager: remotion_packageManager,
									});
								},
								type: 'item' as const,
								keyHint: null,
								leftItem: null,
								subMenu: null,
								quickSwitcherLabel: `Install package...`,
							},
				].filter(Internals.truthy),
				quickSwitcherLabel: null,
			},
			{
				id: 'help' as const,
				label: 'Help',
				leaveLeftPadding: false,
				items: [
					{
						id: 'shortcuts',
						value: 'shortcuts',
						label: keyboardShortcutsDisabled
							? 'Shortcuts (disabled)'
							: 'Shortcuts',
						onClick: () => {
							closeMenu();

							setSelectedModal({
								type: 'quick-switcher',
								mode: 'docs',
								invocationTimestamp: Date.now(),
								assetSelection: null,
								compositionSelection: null,
							});
						},
						keyHint: '?',
						leftItem: null,
						subMenu: null,
						type: 'item' as const,
						quickSwitcherLabel: keyboardShortcutsDisabled
							? 'Show all Keyboard Shortcuts (disabled)'
							: 'Show all Keyboard Shortcuts',
					},
					{
						id: 'docs',
						value: 'docs',
						label: 'Docs',
						onClick: () => {
							closeMenu();
							openExternal('https://remotion.dev/docs');
						},
						type: 'item' as const,
						keyHint: null,
						leftItem: null,
						subMenu: null,
						quickSwitcherLabel: 'Visit Documentation',
					},
					{
						id: 'file-issue',
						value: 'file-issue',
						label: 'File an issue',
						onClick: () => {
							closeMenu();
							openExternal(
								'https://github.com/remotion-dev/remotion/issues/new/choose',
							);
						},
						type: 'item' as const,
						keyHint: null,
						leftItem: null,
						subMenu: null,
						quickSwitcherLabel: 'File GitHub issue',
					},
					{
						id: 'discord',
						value: 'discord',
						label: 'Join Discord community',
						onClick: () => {
							closeMenu();
							openExternal('https://discord.com/invite/6VzzNDwUwV');
						},
						type: 'item' as const,
						keyHint: null,
						leftItem: null,
						subMenu: null,
						quickSwitcherLabel: null,
					},
					{
						id: 'help-divider-6',
						type: 'divider' as const,
					},
					{
						id: 'insta',
						value: 'insta',
						label: 'Instagram',
						onClick: () => {
							closeMenu();
							openExternal('https://instagram.com/remotion');
						},
						type: 'item' as const,
						keyHint: null,
						leftItem: null,
						subMenu: null,
						quickSwitcherLabel: 'Follow Remotion on Instagram',
					},
					{
						id: 'x',
						value: 'x',
						label: 'X',
						onClick: () => {
							closeMenu();
							openExternal('https://x.com/remotion');
						},
						type: 'item' as const,
						keyHint: null,
						leftItem: null,
						subMenu: null,
						quickSwitcherLabel: 'Follow Remotion on X',
					},
					{
						id: 'youtube',
						value: 'youtube',
						label: 'YouTube',
						onClick: () => {
							closeMenu();
							openExternal('https://www.youtube.com/@remotion_dev');
						},
						type: 'item' as const,
						keyHint: null,
						leftItem: null,
						subMenu: null,
						quickSwitcherLabel: 'Watch Remotion on YouTube',
					},
					{
						id: 'linkedin',
						value: 'linkedin',
						label: 'LinkedIn',
						onClick: () => {
							closeMenu();
							openExternal('https://www.linkedin.com/company/remotion-dev/');
						},
						type: 'item' as const,
						keyHint: null,
						leftItem: null,
						subMenu: null,
						quickSwitcherLabel: 'Follow Remotion on LinkedIn',
					},
					{
						id: 'tiktok',
						value: 'tiktok',
						label: 'TikTok',
						onClick: () => {
							closeMenu();
							openExternal('https://www.tiktok.com/@remotion');
						},
						type: 'item' as const,
						keyHint: null,
						leftItem: null,
						subMenu: null,
						quickSwitcherLabel: 'Follow Remotion on TikTok',
					},
				],
			},
		].filter(Internals.truthy);
		if (mobileLayout) {
			struct = [
				{
					...struct[0],
					items: [
						...struct.slice(1).map((s) => {
							return {
								...s,
								keyHint: null,
								onClick: () => undefined,
								type: 'item' as const,
								value: s.id,
								leftItem: null,
								subMenu: {
									items: s.items,
									leaveLeftSpace: true,
									preselectIndex: 0,
								},
								quickSwitcherLabel: null,
							} as SelectionItem;
						}),
						...struct[0].items,
					],
				},
			];
		}

		return struct;
	}, [
		canConfigureDefaultEditor,
		readOnlyStudio,
		closeMenu,
		type,
		sizePreselectIndex,
		sizes,
		currentComposition,
		resolvedCompositionLocation,
		editorZoomGestures,
		editorShowRulers,
		editorShowGuides,
		editorSnapping,
		sidebarCollapsedStateLeft,
		sidebarCollapsedStateRight,
		checkerboard,
		isFullscreenSupported,
		remotion_packageManager,
		mobileLayout,
		editorName,
		keyboardShortcutsDisabled,
		studioAskAIEnabled,
		size.size,
		setSize,
		setEditorZoomGestures,
		setEditorShowRulers,
		setEditorShowGuides,
		setEditorSnapping,
		setSidebarCollapsedState,
		setCheckerboard,
		setSelectedModal,
	]);

	return structure;
};

const getItemLabel = (item: SelectionItem) => {
	if (item.quickSwitcherLabel !== null) {
		return item.quickSwitcherLabel;
	}

	if (typeof item.label === 'string') {
		return item.label;
	}

	return item.label?.toString() as string;
};

const itemToSearchResult = (
	item: SelectionItem,
	setSelectedModal: (value: React.SetStateAction<ModalState | null>) => void,
	prefixes: string[],
): TQuickSwitcherResult[] => {
	if (item.disabled) {
		return [];
	}

	if (item.subMenu) {
		return item.subMenu.items
			.map((subItem) => {
				if (subItem.type === 'divider') {
					return null;
				}

				return itemToSearchResult(subItem, setSelectedModal, [
					...prefixes,
					getItemLabel(item),
				]);
			})
			.flat(1)
			.filter(NoReactInternals.truthy);
	}

	return [
		{
			type: 'menu-item',
			id: item.id,
			onSelected: () => {
				setSelectedModal(null);
				item.onClick(item.id, null);
			},
			title: [...prefixes, getItemLabel(item)].join(': '),
		},
	];
};

export const makeSearchResults = (
	actions: Structure,
	setSelectedModal: (value: React.SetStateAction<ModalState | null>) => void,
) => {
	const items: TQuickSwitcherResult[] = actions
		.map((menu) => {
			return menu.items.map((item): TQuickSwitcherResult[] | null => {
				if (item.type === 'divider') {
					return null;
				}

				return itemToSearchResult(item, setSelectedModal, []);
			});
		})
		.flat(Infinity)
		.filter(NoReactInternals.truthy) as TQuickSwitcherResult[];

	return items;
};
