import React, {useCallback, useContext} from 'react';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {getElementLibraryLabel} from '../helpers/get-element-library-label';
import {canEditStudioConfig} from '../helpers/settings-tab-availability';
import {GearIcon} from '../icons/gear';
import {
	type ElementInstallModalState,
	type ElementLibraryModalState,
	SetSelectedModalContext,
} from '../state/modals';
import {ElementInstallConfirmation} from './ElementInstallConfirmation';
import {
	ElementLibrariesSettings,
	REMOTION_ELEMENTS_URL,
} from './ElementLibrariesSettings';
import {ElementLibraryFrame} from './ElementLibraryFrame';
import {ElementLibraryIcon} from './ElementLibraryIcon';
import {FullscreenPanel} from './FullscreenPanel';
import {VERTICAL_SCROLLBAR_CLASSNAME} from './Menu/is-menu-item';
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

export const ElementLibraryModal: React.FC<{
	readonly name: string;
	readonly url: string;
	readonly view: ElementLibraryModalState['view'];
	readonly installState: ElementInstallModalState | null;
}> = ({name, url, view, installState}) => {
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const {studioRuntimeConfig} = useSettings();
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
		<FullscreenPanel ariaLabel="Elements" rightAction={null}>
			<div style={horizontalLayout}>
				<nav style={sidebar} aria-label="Element libraries">
					<div style={libraryList} className={VERTICAL_SCROLLBAR_CLASSNAME}>
						{libraries.map((library) => {
							const label = getElementLibraryLabel(library);
							return (
								<VerticalTab
									key={library.url}
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
