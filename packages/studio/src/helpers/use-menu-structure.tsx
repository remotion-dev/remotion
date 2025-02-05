import {useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {restartStudio} from '../api/restart-studio';
import type {Menu} from '../components/Menu/MenuItem';
import type {
	ComboboxValue,
	SelectionItem,
} from '../components/NewComposition/ComboBox';
import {showNotification} from '../components/Notifications/NotificationCenter';
import type {TQuickSwitcherResult} from '../components/QuickSwitcher/QuickSwitcherResult';
import {getPreviewSizeLabel, getUniqueSizes} from '../components/SizeSelector';
import {inOutHandles} from '../components/TimelineInOutToggle';
import {Row} from '../components/layout';
import {cmdOrCtrlCharacter} from '../error-overlay/remotion-overlay/ShortcutHint';
import {Checkmark} from '../icons/Checkmark';
import {drawRef} from '../state/canvas-ref';
import {CheckerboardContext} from '../state/checkerboard';
import {EditorShowGuidesContext} from '../state/editor-guides';
import {EditorShowRulersContext} from '../state/editor-rulers';
import {EditorZoomGesturesContext} from '../state/editor-zoom-gestures';
import type {ModalState} from '../state/modals';
import {ModalsContext} from '../state/modals';
import type {SidebarCollapsedState} from '../state/sidebar';
import {SidebarContext} from '../state/sidebar';
import {checkFullscreenSupport} from './check-fullscreen-support';
import {StudioServerConnectionCtx} from './client-id';
import {getGitMenuItem} from './get-git-menu-item';
import {useMobileLayout} from './mobile-layout';
import {openInEditor} from './open-in-editor';
import {pickColor} from './pick-color';
import {areKeyboardShortcutsDisabled} from './use-keybinding';

type Structure = Menu[];

const openExternal = (link: string) => {
	window.open(link, '_blank');
};

const rotate: React.CSSProperties = {
	transform: `rotate(90deg)`,
};
const ICON_SIZE = 16;

const getFileMenu = ({
	readOnlyStudio,
	closeMenu,
	previewServerState,
}: {
	readOnlyStudio: boolean;
	closeMenu: () => void;
	previewServerState: 'connected' | 'init' | 'disconnected';
}) => {
	const items: ComboboxValue[] = [
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
							'render-modal-button',
						) as HTMLDivElement;

						renderButton.click();
					},
					type: 'item' as const,
					keyHint: 'R',
					leftItem: null,
					subMenu: null,
					quickSwitcherLabel: 'Render...',
				},
		window.remotion_editorName && !readOnlyStudio
			? {
					type: 'divider' as const,
					id: 'open-in-editor-divider',
				}
			: null,
		window.remotion_editorName && !readOnlyStudio
			? {
					id: 'open-in-editor',
					value: 'open-in-editor',
					label: `Open in ${window.remotion_editorName}`,
					onClick: async () => {
						await openInEditor({
							originalFileName: `${window.remotion_cwd}`,
							originalLineNumber: 1,
							originalColumnNumber: 1,
							originalFunctionName: null,
							originalScriptCode: null,
						})
							.then((res) => res.json())
							.then(({success}) => {
								if (!success) {
									showNotification(
										`Could not open ${window.remotion_editorName}`,
										2000,
									);
								}
							})
							.catch((err) => {
								// eslint-disable-next-line no-console
								console.error(err);
								showNotification(
									`Could not open ${window.remotion_editorName}`,
									2000,
								);
							});
					},
					type: 'item' as const,
					keyHint: null,
					leftItem: null,
					subMenu: null,
					quickSwitcherLabel: 'Open in editor...',
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

export const useMenuStructure = (
	closeMenu: () => void,
	readOnlyStudio: boolean,
) => {
	const {setSelectedModal} = useContext(ModalsContext);
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
	const {size, setSize} = useContext(Internals.PreviewSizeContext);
	const {type} = useContext(StudioServerConnectionCtx).previewServerState;

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
	const structure = useMemo((): Structure => {
		let struct: Structure = [
			{
				id: 'remotion' as const,
				label: (
					<Row align="center" justify="center">
						<svg
							width={ICON_SIZE}
							height={ICON_SIZE}
							viewBox="-100 -100 400 400"
							style={rotate}
						>
							<path
								fill="#fff"
								stroke="#fff"
								strokeWidth="100"
								strokeLinejoin="round"
								d="M 2 172 a 196 100 0 0 0 195 5 A 196 240 0 0 0 100 2.259 A 196 240 0 0 0 2 172 z"
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
						id: 'license',
						value: 'license',
						label: 'License',
						onClick: () => {
							closeMenu();
							openExternal(
								'https://github.com/remotion-dev/remotion/blob/main/LICENSE.md',
							);
						},
						type: 'item' as const,
						keyHint: null,
						leftItem: null,
						subMenu: null,
						quickSwitcherLabel: 'Help: License',
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
				],
				quickSwitcherLabel: null,
			},
			getFileMenu({
				readOnlyStudio,
				closeMenu,
				previewServerState: type,
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
				id: 'tools' as const,
				label: 'Tools',
				leaveLeftPadding: false,
				items: [
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
					{
						id: 'spring-editor',
						value: 'spring-editor',
						label: 'spring() Editor',
						onClick: () => {
							closeMenu();
							window.open('https://springs.remotion.dev', '_blank');
						},
						leftItem: null,
						keyHint: null,
						subMenu: null,
						type: 'item' as const,
						quickSwitcherLabel: 'Open spring() Editor',
					},
				].filter(Internals.truthy),
				quickSwitcherLabel: null,
			},
			readOnlyStudio || remotion_packageManager === 'unknown'
				? null
				: {
						id: 'install' as const,
						label: 'Packages',
						leaveLeftPadding: false,
						items: [
							{
								id: 'install-packages',
								value: 'install-packages',
								label: 'Install...',
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
								quickSwitcherLabel: `Install packages`,
							},
						],
					},
			{
				id: 'help' as const,
				label: 'Help',
				leaveLeftPadding: false,
				items: [
					{
						id: 'shortcuts',
						value: 'shortcuts',
						label: areKeyboardShortcutsDisabled()
							? 'Shortcuts (disabled)'
							: 'Shortcuts',
						onClick: () => {
							closeMenu();

							setSelectedModal({
								type: 'quick-switcher',
								mode: 'docs',
								invocationTimestamp: Date.now(),
							});
						},
						keyHint: '?',
						leftItem: null,
						subMenu: null,
						type: 'item' as const,
						quickSwitcherLabel: areKeyboardShortcutsDisabled()
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
		readOnlyStudio,
		closeMenu,
		type,
		sizePreselectIndex,
		sizes,
		editorZoomGestures,
		editorShowRulers,
		editorShowGuides,
		sidebarCollapsedStateLeft,
		sidebarCollapsedStateRight,
		checkerboard,
		isFullscreenSupported,
		remotion_packageManager,
		mobileLayout,
		size.size,
		setSize,
		setEditorZoomGestures,
		setEditorShowRulers,
		setEditorShowGuides,
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
