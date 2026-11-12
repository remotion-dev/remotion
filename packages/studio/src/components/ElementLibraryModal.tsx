import {PlayerInternals} from '@remotion/player';
import type {StudioElementLibrary} from '@remotion/studio-shared';
import React, {
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {
	CURRENT_COLOR,
	LIGHT_TEXT,
	TIMELINE_BLUE,
	WHITE_ALPHA_05,
	WHITE_ALPHA_08,
} from '../helpers/colors';
import {THIRD_PARTY_ELEMENTS_URL} from '../helpers/element-libraries';
import {getElementLibraryLabel} from '../helpers/get-element-library-label';
import {FOCUS_VISIBLE_ONLY_CLASS_NAME} from '../helpers/hoverable';
import {canEditStudioConfig} from '../helpers/settings-tab-availability';
import {BrowseElementsIcon} from '../icons/browse-elements';
import {GearIcon} from '../icons/gear';
import {TrashIcon} from '../icons/trash';
import {
	type ElementInstallModalState,
	type ElementLibraryModalState,
	SetSelectedModalContext,
} from '../state/modals';
import {ContextMenu} from './ContextMenu';
import {ElementInstallConfirmation} from './ElementInstallConfirmation';
import {ElementLibrariesSettings} from './ElementLibrariesSettings';
import {ElementLibraryDialog} from './ElementLibraryDialog';
import {ElementLibraryFrame} from './ElementLibraryFrame';
import {ElementLibraryIcon} from './ElementLibraryIcon';
import {FullscreenPanel} from './FullscreenPanel';
import {VERTICAL_SCROLLBAR_CLASSNAME} from './Menu/is-menu-item';
import {MenuDivider} from './Menu/MenuDivider';
import type {ComboboxValue} from './NewComposition/ComboBox';
import {
	horizontalLayout,
	horizontalTab,
	iconContainer,
	leftSidebar,
	optionsPanel,
} from './RenderModal/render-modals';
import {useSettings} from './SettingsContext';
import {SettingsModalFooter} from './SettingsModalFooter';
import {VerticalTab} from './Tabs/vertical';

const sidebar: React.CSSProperties = {
	...leftSidebar,
	minHeight: 0,
	paddingLeft: 8,
};

const libraryList: React.CSSProperties = {
	display: 'flex',
	flex: 1,
	flexDirection: 'column',
	minHeight: 0,
	overflowY: 'auto',
};

const tabStyle: React.CSSProperties = {
	...horizontalTab,
	cursor: 'default',
	width: 190,
};

const exploreIconContainer: React.CSSProperties = {
	...iconContainer,
	flexShrink: 0,
	height: 22,
	marginLeft: -2,
	marginRight: 6,
	width: 22,
};

const content: React.CSSProperties = {
	display: 'flex',
	flex: 1,
	flexDirection: 'column',
	minHeight: 0,
	minWidth: 0,
};

const hiddenContent: React.CSSProperties = {
	display: 'none',
};

const urlBar: React.CSSProperties = {
	backgroundColor: WHITE_ALPHA_05,
	border: `1px solid ${WHITE_ALPHA_08}`,
	borderRadius: 4,
	display: 'flex',
	height: 22,
	maxWidth: 640,
	minWidth: 0,
	padding: '0 8px',
	width: '100%',
};

const urlText: React.CSSProperties = {
	backgroundColor: 'transparent',
	border: 'none',
	color: LIGHT_TEXT,
	cursor: 'default',
	fontFamily: 'inherit',
	fontSize: 12,
	height: '100%',
	maskImage:
		'linear-gradient(to right, black calc(100% - 16px), transparent calc(100% - 6px))',
	minWidth: 0,
	padding: 0,
	textOverflow: 'clip',
	WebkitMaskImage:
		'linear-gradient(to right, black calc(100% - 16px), transparent calc(100% - 6px))',
	width: '100%',
};

const reorderRow: React.CSSProperties = {
	position: 'relative',
};

const reorderLine: React.CSSProperties = {
	backgroundColor: TIMELINE_BLUE,
	height: 2,
	left: 0,
	pointerEvents: 'none',
	position: 'absolute',
	right: 0,
	zIndex: 1,
};

const libraryReorderMimeType = 'application/remotion-element-library-reorder';

export const ElementLibraryModal: React.FC<{
	readonly name: string;
	readonly url: string;
	readonly view: ElementLibraryModalState['view'];
	readonly installState: ElementInstallModalState | null;
}> = ({name, url, view, installState}) => {
	const sidebarRef = useRef<HTMLElement>(null);
	const sidebarSize = PlayerInternals.useElementSize(sidebarRef, {
		triggerOnWindowResize: true,
		shouldApplyCssTransforms: true,
	});
	const [iframeUrl, setIframeUrl] = useState('');
	const [libraryDialog, setLibraryDialog] = useState<{
		library: StudioElementLibrary | null;
	} | null>(null);
	const closeLibraryDialog = useCallback(() => setLibraryDialog(null), []);
	const draggedLibrary = useRef<string | null>(null);
	const [dropTarget, setDropTarget] = useState<{
		url: string;
		before: boolean;
	} | null>(null);
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const {studioRuntimeConfig, removeElementLibrary, reorderElementLibraries} =
		useSettings();
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const canManageLibraries = canEditStudioConfig({
		isBrowserStudio: getBrowserStudioOperations() !== null,
		previewServerConnected: previewServerState.type === 'connected',
		readOnlyStudio: window.remotion_isReadOnlyStudio,
	});
	const showManagement = view === 'manage' && canManageLibraries;
	const libraries = studioRuntimeConfig?.elementLibraries ?? [];
	useEffect(() => {
		if (
			studioRuntimeConfig === null ||
			view !== 'library' ||
			url === THIRD_PARTY_ELEMENTS_URL ||
			studioRuntimeConfig.elementLibraries.some(
				(library) => library.url === url,
			)
		)
			return;
		const nextLibrary = studioRuntimeConfig.elementLibraries[0];
		setSelectedModal((current) =>
			current?.type === 'element-library' && current.url === url
				? {
						...current,
						name: nextLibrary ? getElementLibraryLabel(nextLibrary) : 'Explore',
						url: nextLibrary?.url ?? THIRD_PARTY_ELEMENTS_URL,
					}
				: current,
		);
	}, [setSelectedModal, studioRuntimeConfig, url, view]);
	const moveLibrary = (libraryUrl: string, toIndex: number) => {
		const urls = libraries.map((library) => library.url);
		const fromIndex = urls.indexOf(libraryUrl);
		if (
			fromIndex === -1 ||
			fromIndex === toIndex ||
			toIndex < 0 ||
			toIndex >= urls.length
		)
			return;
		urls.splice(fromIndex, 1);
		urls.splice(toIndex, 0, libraryUrl);
		reorderElementLibraries(urls);
	};

	const getDropTarget = (
		event: React.DragEvent<HTMLDivElement>,
		index: number,
	) => {
		if (
			!canManageLibraries ||
			!Array.from(event.dataTransfer.types).includes(libraryReorderMimeType)
		)
			return null;
		const draggedUrl =
			draggedLibrary.current ??
			event.dataTransfer.getData(libraryReorderMimeType);
		const fromIndex = libraries.findIndex(
			(library) => library.url === draggedUrl,
		);
		if (fromIndex === -1) return null;
		const rect = event.currentTarget.getBoundingClientRect();
		const before = event.clientY < rect.top + rect.height / 2;
		const insertionIndex = before ? index : index + 1;
		const toIndex =
			insertionIndex > fromIndex ? insertionIndex - 1 : insertionIndex;
		return toIndex === fromIndex ? null : {before, toIndex};
	};

	const openElementSettings = useCallback(() => {
		setSelectedModal((current) =>
			current?.type === 'element-library'
				? {...current, view: 'manage'}
				: current,
		);
	}, [setSelectedModal]);

	return (
		<FullscreenPanel
			ariaLabel="Elements"
			headerContent={
				showManagement ? null : (
					<div style={urlBar}>
						<input
							aria-label="Element library URL"
							className={FOCUS_VISIBLE_ONLY_CLASS_NAME}
							readOnly
							style={urlText}
							type="text"
							value={iframeUrl}
						/>
					</div>
				)
			}
			rightAction={null}
			sidebarWidth={sidebarSize?.width ?? null}
		>
			<div style={horizontalLayout}>
				<nav
					ref={sidebarRef}
					style={sidebar}
					aria-label="Element libraries"
					onContextMenu={(event) => {
						if (
							!canManageLibraries ||
							(event.target instanceof Element &&
								event.target.closest('button'))
						)
							return;
						event.preventDefault();
						setLibraryDialog({library: null});
					}}
				>
					<VerticalTab
						draggable={false}
						style={tabStyle}
						selected={!showManagement && url === THIRD_PARTY_ELEMENTS_URL}
						onClick={() => {
							setSelectedModal({
								type: 'element-library',
								name: 'Explore',
								url: THIRD_PARTY_ELEMENTS_URL,
								view: 'library',
							});
						}}
						renderIcon={(color) => (
							<div style={exploreIconContainer}>
								<BrowseElementsIcon
									color={color}
									style={{width: 22, height: 22}}
								/>
							</div>
						)}
					>
						Explore
					</VerticalTab>
					<MenuDivider />
					<div
						style={libraryList}
						className={VERTICAL_SCROLLBAR_CLASSNAME}
						onDragLeave={(event) => {
							if (
								event.relatedTarget instanceof Node &&
								event.currentTarget.contains(event.relatedTarget)
							)
								return;
							setDropTarget(null);
						}}
					>
						{libraries.map((library, index) => {
							const label = getElementLibraryLabel(library);
							return (
								<div
									key={library.url}
									style={reorderRow}
									onDragStart={(event) => {
										draggedLibrary.current = library.url;
										event.dataTransfer.effectAllowed = 'move';
										event.dataTransfer.setData(
											libraryReorderMimeType,
											library.url,
										);
										event.stopPropagation();
									}}
									onDragEnd={() => {
										draggedLibrary.current = null;
										setDropTarget(null);
									}}
									onDragOver={(event) => {
										const target = getDropTarget(event, index);
										if (target === null) {
											setDropTarget(null);
											return;
										}

										event.preventDefault();
										event.stopPropagation();
										event.dataTransfer.dropEffect = 'move';
										setDropTarget((current) =>
											current?.url === library.url &&
											current.before === target.before
												? current
												: {url: library.url, before: target.before},
										);
									}}
									onDrop={(event) => {
										const target = getDropTarget(event, index);
										const fromUrl =
											draggedLibrary.current ??
											event.dataTransfer.getData(libraryReorderMimeType);
										draggedLibrary.current = null;
										setDropTarget(null);
										if (target === null || fromUrl === null) return;
										event.preventDefault();
										event.stopPropagation();
										moveLibrary(fromUrl, target.toIndex);
									}}
									onKeyDown={(event) => {
										if (
											!canManageLibraries ||
											!event.altKey ||
											!['ArrowUp', 'ArrowDown'].includes(event.key)
										)
											return;
										event.preventDefault();
										event.stopPropagation();
										moveLibrary(
											library.url,
											index + (event.key === 'ArrowUp' ? -1 : 1),
										);
									}}
								>
									{dropTarget?.url === library.url ? (
										<div
											style={{
												...reorderLine,
												...(dropTarget.before ? {top: 0} : {bottom: 0}),
											}}
										/>
									) : null}
									<ContextMenu
										getItems={(): ComboboxValue[] | false => {
											if (!canManageLibraries) return false;
											return [
												{
													type: 'item',
													id: 'edit-library',
													value: 'edit-library',
													label: 'Edit library…',
													keyHint: null,
													leftItem: null,
													subMenu: null,
													quickSwitcherLabel: null,
													onClick: () => setLibraryDialog({library}),
												},
												{type: 'divider', id: 'edit-library-divider'},
												{
													type: 'item',
													id: 'move-library-up',
													value: 'move-library-up',
													label: 'Move up',
													keyHint: 'Alt+↑',
													disabled: index === 0,
													leftItem: null,
													subMenu: null,
													quickSwitcherLabel: null,
													onClick: () => moveLibrary(library.url, index - 1),
												},
												{
													type: 'item',
													id: 'move-library-down',
													value: 'move-library-down',
													label: 'Move down',
													keyHint: 'Alt+↓',
													disabled: index === libraries.length - 1,
													leftItem: null,
													subMenu: null,
													quickSwitcherLabel: null,
													onClick: () => moveLibrary(library.url, index + 1),
												},
												{type: 'divider', id: 'remove-library-divider'},
												{
													type: 'item',
													id: 'remove-library',
													value: 'remove-library',
													label: 'Remove library',
													leftItem: (
														<TrashIcon
															color={CURRENT_COLOR}
															style={{width: 16, height: 16}}
														/>
													),
													keyHint: null,
													quickSwitcherLabel: null,
													subMenu: null,
													onClick: () => removeElementLibrary(library.url),
												},
											];
										}}
									>
										<VerticalTab
											draggable={canManageLibraries && libraries.length > 1}
											style={tabStyle}
											selected={!showManagement && url === library.url}
											onClick={() => {
												setSelectedModal({
													type: 'element-library',
													name: label,
													url: library.url,
													view: 'library',
												});
											}}
											renderIcon={(color) => (
												<div style={iconContainer}>
													<ElementLibraryIcon
														url={library.url}
														color={color}
														size={20}
													/>
												</div>
											)}
										>
											{label}
										</VerticalTab>
									</ContextMenu>
								</div>
							);
						})}
					</div>
					{canManageLibraries && (
						<VerticalTab
							draggable={false}
							style={tabStyle}
							selected={showManagement}
							onClick={openElementSettings}
							renderIcon={(color) => (
								<div style={iconContainer}>
									<GearIcon color={color} width={18} height={18} />
								</div>
							)}
						>
							Manage libraries
						</VerticalTab>
					)}
				</nav>
				<div style={content}>
					<div style={showManagement ? hiddenContent : content}>
						<ElementLibraryFrame
							name={name}
							url={url}
							context={null}
							captionStyleSelection={null}
							onUrlChange={setIframeUrl}
						/>
					</div>
					{showManagement && (
						<>
							<div
								style={optionsPanel}
								className={VERTICAL_SCROLLBAR_CLASSNAME}
							>
								<ElementLibrariesSettings />
							</div>
							<SettingsModalFooter showAboutElements showLicenseFaq={false} />
						</>
					)}
				</div>
			</div>
			{libraryDialog === null ? null : (
				<ElementLibraryDialog
					library={libraryDialog.library}
					onClose={closeLibraryDialog}
				/>
			)}
			{installState === null ? null : (
				<ElementInstallConfirmation state={installState} />
			)}
		</FullscreenPanel>
	);
};
