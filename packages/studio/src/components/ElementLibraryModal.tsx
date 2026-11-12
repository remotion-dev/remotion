import React, {useCallback, useContext, useState} from 'react';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {
	CURRENT_COLOR,
	LIGHT_TEXT,
	WHITE_ALPHA_05,
	WHITE_ALPHA_08,
} from '../helpers/colors';
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
import {
	ElementLibrariesSettings,
	REMOTION_ELEMENTS_URL,
	THIRD_PARTY_ELEMENTS_URL,
} from './ElementLibrariesSettings';
import {ElementLibraryFrame} from './ElementLibraryFrame';
import {ElementLibraryIcon} from './ElementLibraryIcon';
import {FullscreenPanel} from './FullscreenPanel';
import {VERTICAL_SCROLLBAR_CLASSNAME} from './Menu/is-menu-item';
import {MenuDivider} from './Menu/MenuDivider';
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
	color: LIGHT_TEXT,
	cursor: 'default',
	fontFamily: 'inherit',
	fontSize: 12,
	height: 22,
	maxWidth: 640,
	minWidth: 0,
	padding: '0 8px',
	textOverflow: 'ellipsis',
	width: '100%',
};

export const ElementLibraryModal: React.FC<{
	readonly name: string;
	readonly url: string;
	readonly view: ElementLibraryModalState['view'];
	readonly installState: ElementInstallModalState | null;
}> = ({name, url, view, installState}) => {
	const [iframeUrl, setIframeUrl] = useState('');
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const {studioRuntimeConfig, removeElementLibrary} = useSettings();
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const canManageLibraries = canEditStudioConfig({
		isBrowserStudio: getBrowserStudioOperations() !== null,
		previewServerConnected: previewServerState.type === 'connected',
		readOnlyStudio: window.remotion_isReadOnlyStudio,
	});
	const showManagement = view === 'manage' && canManageLibraries;
	const libraries = [
		{url: REMOTION_ELEMENTS_URL, displayName: 'Remotion Elements'},
		...(studioRuntimeConfig?.elementLibraries ?? []).filter(
			(library) => library.url !== REMOTION_ELEMENTS_URL,
		),
	];
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
					<input
						aria-label="Element library URL"
						className={FOCUS_VISIBLE_ONLY_CLASS_NAME}
						readOnly
						style={urlBar}
						type="text"
						value={iframeUrl}
					/>
				)
			}
			rightAction={null}
		>
			<div style={horizontalLayout}>
				<nav style={sidebar} aria-label="Element libraries">
					<VerticalTab
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
					<div style={libraryList} className={VERTICAL_SCROLLBAR_CLASSNAME}>
						{libraries.map((library) => {
							const label = getElementLibraryLabel(library);
							return (
								<ContextMenu
									key={library.url}
									getItems={() =>
										canManageLibraries && library.url !== REMOTION_ELEMENTS_URL
											? [
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
														onClick: () => {
															removeElementLibrary(library.url);
															setSelectedModal((current) =>
																current?.type === 'element-library' &&
																current.url === library.url
																	? {
																			...current,
																			name: 'Remotion Elements',
																			url: REMOTION_ELEMENTS_URL,
																		}
																	: current,
															);
														},
													},
												]
											: false
									}
								>
									<VerticalTab
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
							);
						})}
					</div>
					{canManageLibraries && (
						<VerticalTab
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
			{installState === null ? null : (
				<ElementInstallConfirmation state={installState} />
			)}
		</FullscreenPanel>
	);
};
