import {useContext, useMemo} from 'react';
import {Internals} from 'remotion';
import {cmdOrCtrlCharacter} from '../../preview-server/error-overlay/remotion-overlay/ShortcutHint';
import {truthy} from '../../truthy';
import {Row} from '../components/layout';
import type {Menu} from '../components/Menu/MenuItem';
import type {SelectionItem} from '../components/NewComposition/ComboBox';
import {sendErrorNotification} from '../components/Notifications/NotificationCenter';
import type {TQuickSwitcherResult} from '../components/QuickSwitcher/QuickSwitcherResult';
import {getPreviewSizeLabel, getUniqueSizes} from '../components/SizeSelector';
import {inOutHandles} from '../components/TimelineInOutToggle';
import {Checkmark} from '../icons/Checkmark';
import {CheckerboardContext} from '../state/checkerboard';
import {EditorZoomGesturesContext} from '../state/editor-zoom-gestures';
import type {ModalState} from '../state/modals';
import {ModalsContext} from '../state/modals';
import {PreviewSizeContext} from '../state/preview-size';
import type {SidebarCollapsedState} from '../state/sidebar';
import {SidebarContext} from '../state/sidebar';
import {timelineRef} from '../state/timeline-ref';
import {StudioServerConnectionCtx} from './client-id';
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

export const useMenuStructure = (closeMenu: () => void) => {
	const {setSelectedModal} = useContext(ModalsContext);
	const {checkerboard, setCheckerboard} = useContext(CheckerboardContext);
	const {editorZoomGestures, setEditorZoomGestures} = useContext(
		EditorZoomGesturesContext
	);
	const {size, setSize} = useContext(PreviewSizeContext);
	const {type} = useContext(StudioServerConnectionCtx);

	const {
		setSidebarCollapsedState,
		sidebarCollapsedStateLeft,
		sidebarCollapsedStateRight,
	} = useContext(SidebarContext);
	const sizes = getUniqueSizes(size);

	const structure = useMemo((): Structure => {
		const struct: Structure = [
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
								'https://github.com/remotion-dev/remotion/blob/main/LICENSE.md'
							);
						},
						type: 'item' as const,
						keyHint: null,
						leftItem: null,
						subMenu: null,
						quickSwitcherLabel: 'Help: License',
					},
				],
				quickSwitcherLabel: null,
			},
			{
				id: 'file' as const,
				label: 'File',
				leaveLeftPadding: false,
				items: [
					{
						id: 'new-sequence',
						value: 'new-sequence',
						label: 'New composition...',
						onClick: () => {
							closeMenu();
							setSelectedModal({
								compType: 'composition',
								type: 'new-comp',
							});
						},
						type: 'item' as const,
						keyHint: 'N',
						leftItem: null,
						subMenu: null,
						quickSwitcherLabel: 'New composition...',
					},
					{
						id: 'new-still',
						value: 'new-still',
						label: 'New still...',
						onClick: () => {
							closeMenu();
							setSelectedModal({
								compType: 'still',
								type: 'new-comp',
							});
						},
						type: 'item' as const,
						keyHint: null,
						leftItem: null,
						subMenu: null,
						quickSwitcherLabel: 'New still...',
					},
					{
						type: 'divider' as const,
						id: 'new-divider',
					},
					{
						id: 'render',
						value: 'render',
						label: 'Render...',
						onClick: () => {
							closeMenu();
							if (type !== 'connected') {
								sendErrorNotification('Restart the studio to render');
								return;
							}

							const renderButton = document.getElementById(
								'render-modal-button'
							) as HTMLDivElement;

							renderButton.click();
						},
						type: 'item' as const,
						keyHint: 'R',
						leftItem: null,
						subMenu: null,
						quickSwitcherLabel: 'Render...',
					},
					window.remotion_editorName
						? {
								type: 'divider' as const,
								id: 'open-in-editor-divider',
						  }
						: null,
					window.remotion_editorName
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
												sendErrorNotification(
													`Could not open ${window.remotion_editorName}`
												);
											}
										})
										.catch((err) => {
											console.error(err);
											sendErrorNotification(
												`Could not open ${window.remotion_editorName}`
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
				].filter(truthy),
				quickSwitcherLabel: null,
			},
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
							preselectIndex: sizes.findIndex(
								(s) => String(size.size) === String(s.size)
							),
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
										setSidebarCollapsedState({left: 'collapsed', right: null});
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
										setSidebarCollapsedState({left: null, right: 'collapsed'});
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
						id: 'expand-all',
						keyHint: null,
						label: 'Expand all',
						onClick: () => {
							closeMenu();
							timelineRef.current?.expandAll();
						},
						type: 'item' as const,
						value: 'expand-all',
						leftItem: null,
						subMenu: null,
						quickSwitcherLabel: 'Timeline: Expand all Timeline layers',
					},
					{
						id: 'collapse-all',
						keyHint: null,
						label: 'Collapse all',
						onClick: () => {
							closeMenu();
							timelineRef.current?.collapseAll();
						},
						type: 'item' as const,
						value: 'collapse-all',
						leftItem: null,
						subMenu: null,
						quickSwitcherLabel: 'Timeline: Collapse all layers',
					},
					{
						id: 'in-out-divider-4',
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
				],
			},
			'EyeDropper' in window
				? {
						id: 'tools' as const,
						label: 'Tools',
						leaveLeftPadding: false,
						items: [
							{
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
							},
						],
						quickSwitcherLabel: null,
				  }
				: null,
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
								'https://github.com/remotion-dev/remotion/issues/new/choose'
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
						id: 'twitter',
						value: 'twitter',
						label: 'Twitter',
						onClick: () => {
							closeMenu();
							openExternal('https://twitter.com/remotion');
						},
						type: 'item' as const,
						keyHint: null,
						leftItem: null,
						subMenu: null,
						quickSwitcherLabel: 'Follow Remotion on Twitter',
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

		return struct;
	}, [
		sizes,
		editorZoomGestures,
		sidebarCollapsedStateLeft,
		sidebarCollapsedStateRight,
		checkerboard,
		closeMenu,
		setSelectedModal,
		type,
		size.size,
		setSize,
		setEditorZoomGestures,
		setSidebarCollapsedState,
		setCheckerboard,
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
	prefixes: string[]
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
			.filter(truthy);
	}

	return [
		{
			type: 'menu-item',
			id: item.id,
			onSelected: () => {
				setSelectedModal(null);
				item.onClick(item.id);
			},
			title: [...prefixes, getItemLabel(item)].join(': '),
		},
	];
};

export const makeSearchResults = (
	actions: Structure,
	setSelectedModal: (value: React.SetStateAction<ModalState | null>) => void
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
		.filter(truthy) as TQuickSwitcherResult[];

	return items;
};
