import React, {
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useState,
} from 'react';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {canShowUpdates} from '../helpers/can-show-updates';
import {StudioServerConnectionCtx} from '../helpers/client-id';
import {
	canEditStudioConfig,
	getAvailableSettingsTabs,
	getSafeSettingsTab,
	type SettingsTab,
} from '../helpers/settings-tab-availability';
import {AppsIcon} from '../icons/apps';
import {BrowseElementsIcon} from '../icons/browse-elements';
import {CloudDownloadIcon} from '../icons/cloud-download';
import {KeyboardIcon} from '../icons/keyboard';
import {LicenseIcon} from '../icons/license';
import {ModelsIcon} from '../icons/models';
import {PackageIcon} from '../icons/package';
import {RemotionTriangleIcon} from '../icons/remotion-triangle';
import {SkillsIcon} from '../icons/skills';
import {FilmIcon} from '../icons/video';
import {SetSelectedModalContext} from '../state/modals';
import {DefaultEditorSettings} from './ConfigureDefaultEditorModal';
import {LicenseSettings} from './ConfigureLicenseModal';
import {ElementLibrariesSettings} from './ElementLibrariesSettings';
import {InstallPackageSettings} from './InstallPackage';
import {KeyboardShortcutsSettings} from './KeyboardShortcutsSettings';
import {VERTICAL_SCROLLBAR_CLASSNAME} from './Menu/is-menu-item';
import {ModalHeader} from './ModalHeader';
import {ModelsSettings} from './ModelsSettings';
import {DismissableModal} from './NewComposition/DismissableModal';
import {RenderingSettings} from './RenderingSettings';
import {
	horizontalLayout,
	horizontalTab,
	icon,
	iconContainer,
	leftSidebar,
	optionsPanel,
	outerModalStyle,
} from './RenderModal/render-modals';
import {useSettings} from './SettingsContext';
import {SettingsModalFooter} from './SettingsModalFooter';
import {SkillsSettings} from './SkillsSettings';
import {StudioSettings} from './StudioSettings';
import {VerticalTab} from './Tabs/vertical';
import {UpdatesSettings} from './UpdatesSettings';
import {useUpdateStatus} from './UpdateStatusContext';

const hiddenPanel: React.CSSProperties = {
	display: 'none',
};

const settingsOptionsPanel: React.CSSProperties = {
	...optionsPanel,
	boxSizing: 'border-box',
	paddingBottom: 16,
};

const settingsLeftSidebar: React.CSSProperties = {
	...leftSidebar,
	paddingLeft: 8,
};

const appsIcon: React.CSSProperties = {
	...icon,
	flexShrink: 0,
	height: 24,
	width: 24,
};

const skillsIcon: React.CSSProperties = {
	...icon,
	flexShrink: 0,
	height: 20,
	width: 20,
};

const keyboardIcon: React.CSSProperties = {
	...icon,
	height: 16,
	width: 16,
};

const elementsIcon: React.CSSProperties = {
	...icon,
	height: 20,
	width: 20,
};

export const SettingsModal: React.FC<{
	readonly initialTab: SettingsTab;
	readonly initialPublicLicenseKey: string | null;
}> = ({initialPublicLicenseKey, initialTab}) => {
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const {setPublicLicenseKey} = useSettings();
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const isBrowserStudio = getBrowserStudioOperations() !== null;
	const {upgradeState} = useUpdateStatus();
	const showUpdates =
		upgradeState !== 'idle' ||
		canShowUpdates({
			connectionStatus: previewServerState.type,
			isBrowserStudio,
			readOnlyStudio: window.remotion_isReadOnlyStudio,
		});
	const packageManager =
		window.remotion_packageManager === 'unknown'
			? null
			: window.remotion_packageManager;
	const previewServerConnected = previewServerState.type === 'connected';
	const canEditConfig = canEditStudioConfig({
		isBrowserStudio,
		previewServerConnected,
		readOnlyStudio: window.remotion_isReadOnlyStudio,
	});
	const availableTabs = useMemo(
		() =>
			getAvailableSettingsTabs({
				isBrowserStudio,
				packageManagerAvailable: packageManager !== null,
				previewServerConnected,
				readOnlyStudio: window.remotion_isReadOnlyStudio,
				showUpdates,
			}),
		[isBrowserStudio, packageManager, previewServerConnected, showUpdates],
	);
	const safeInitialTab = getSafeSettingsTab(initialTab, availableTabs);
	const [tab, setTab] = useState<SettingsTab>(safeInitialTab);
	const [studioPane, setStudioPane] = useState<'general' | 'elements'>(
		'general',
	);
	const [openedTabs, setOpenedTabs] = useState<SettingsTab[]>([safeInitialTab]);
	const [packagesFooterContainer, setPackagesFooterContainer] =
		useState<HTMLDivElement | null>(null);

	const dismiss = useCallback(() => {
		setSelectedModal(null);
	}, [setSelectedModal]);
	const selectTab = useCallback((newTab: SettingsTab) => {
		setTab(newTab);
		setOpenedTabs((currentOpenedTabs) => {
			if (currentOpenedTabs.includes(newTab)) {
				return currentOpenedTabs;
			}

			return [...currentOpenedTabs, newTab];
		});
	}, []);
	useLayoutEffect(() => {
		const safeTab = getSafeSettingsTab(tab, availableTabs);
		if (safeTab !== tab) {
			selectTab(safeTab);
		}
	}, [availableTabs, selectTab, tab]);
	useEffect(() => {
		setPublicLicenseKey(initialPublicLicenseKey);
	}, [initialPublicLicenseKey, setPublicLicenseKey]);

	return (
		<DismissableModal panelStyle={outerModalStyle}>
			<>
				<ModalHeader title="Settings" onClose={dismiss} />
				<div style={horizontalLayout}>
					<div style={settingsLeftSidebar}>
						{availableTabs.includes('studio') ? (
							<VerticalTab
								style={horizontalTab}
								selected={tab === 'studio' && studioPane === 'general'}
								onClick={() => {
									selectTab('studio');
									setStudioPane('general');
								}}
								renderIcon={(color) => (
									<div style={iconContainer}>
										<RemotionTriangleIcon color={color} style={icon} />
									</div>
								)}
							>
								Studio
							</VerticalTab>
						) : null}
						{availableTabs.includes('studio') ? (
							<VerticalTab
								style={horizontalTab}
								selected={tab === 'studio' && studioPane === 'elements'}
								onClick={() => {
									selectTab('studio');
									setStudioPane('elements');
								}}
								renderIcon={(color) => (
									<div style={iconContainer}>
										<BrowseElementsIcon color={color} style={elementsIcon} />
									</div>
								)}
							>
								Elements
							</VerticalTab>
						) : null}
						{availableTabs.includes('rendering') ? (
							<VerticalTab
								style={horizontalTab}
								selected={tab === 'rendering'}
								onClick={() => selectTab('rendering')}
								renderIcon={(color) => (
									<div style={iconContainer}>
										<FilmIcon color={color} style={icon} />
									</div>
								)}
							>
								Defaults
							</VerticalTab>
						) : null}
						<VerticalTab
							style={horizontalTab}
							selected={tab === 'shortcuts'}
							onClick={() => selectTab('shortcuts')}
							renderIcon={(color) => (
								<div style={iconContainer}>
									<KeyboardIcon color={color} style={keyboardIcon} />
								</div>
							)}
						>
							Shortcuts
						</VerticalTab>
						{availableTabs.includes('packages') ? (
							<VerticalTab
								style={horizontalTab}
								selected={tab === 'packages'}
								onClick={() => selectTab('packages')}
								renderIcon={(color) => (
									<div style={iconContainer}>
										<PackageIcon color={color} style={icon} />
									</div>
								)}
							>
								Packages
							</VerticalTab>
						) : null}
						{availableTabs.includes('skills') ? (
							<VerticalTab
								style={horizontalTab}
								selected={tab === 'skills'}
								onClick={() => selectTab('skills')}
								renderIcon={(color) => (
									<div style={iconContainer}>
										<SkillsIcon color={color} style={skillsIcon} />
									</div>
								)}
							>
								Skills
							</VerticalTab>
						) : null}
						{availableTabs.includes('models') ? (
							<VerticalTab
								style={horizontalTab}
								selected={tab === 'models'}
								onClick={() => selectTab('models')}
								renderIcon={(color) => (
									<div style={iconContainer}>
										<ModelsIcon color={color} style={icon} />
									</div>
								)}
							>
								Models
							</VerticalTab>
						) : null}
						{availableTabs.includes('apps') ? (
							<VerticalTab
								style={horizontalTab}
								selected={tab === 'apps'}
								onClick={() => selectTab('apps')}
								renderIcon={(color) => (
									<div style={iconContainer}>
										<AppsIcon color={color} style={appsIcon} />
									</div>
								)}
							>
								Apps
							</VerticalTab>
						) : null}
						{availableTabs.includes('license') ? (
							<VerticalTab
								style={horizontalTab}
								selected={tab === 'license'}
								onClick={() => selectTab('license')}
								renderIcon={(color) => (
									<div style={iconContainer}>
										<LicenseIcon color={color} style={icon} />
									</div>
								)}
							>
								License
							</VerticalTab>
						) : null}
						{availableTabs.includes('updates') ? (
							<VerticalTab
								style={horizontalTab}
								selected={tab === 'updates'}
								onClick={() => selectTab('updates')}
								renderIcon={(color) => (
									<div style={iconContainer}>
										<CloudDownloadIcon color={color} style={icon} />
									</div>
								)}
							>
								Updates
							</VerticalTab>
						) : null}
					</div>
					{availableTabs.includes('packages') &&
					openedTabs.includes('packages') ? (
						<div style={tab === 'packages' ? optionsPanel : hiddenPanel}>
							<InstallPackageSettings
								footerContainer={packagesFooterContainer}
								packageManager={packageManager}
							/>
						</div>
					) : null}
					{availableTabs.includes('apps') && openedTabs.includes('apps') ? (
						<div
							style={tab === 'apps' ? settingsOptionsPanel : hiddenPanel}
							className={VERTICAL_SCROLLBAR_CLASSNAME}
						>
							<DefaultEditorSettings />
						</div>
					) : null}
					{availableTabs.includes('models') && openedTabs.includes('models') ? (
						<div
							style={tab === 'models' ? settingsOptionsPanel : hiddenPanel}
							className={VERTICAL_SCROLLBAR_CLASSNAME}
						>
							<ModelsSettings />
						</div>
					) : null}
					{availableTabs.includes('license') &&
					openedTabs.includes('license') ? (
						<div
							style={tab === 'license' ? settingsOptionsPanel : hiddenPanel}
							className={VERTICAL_SCROLLBAR_CLASSNAME}
						>
							<LicenseSettings />
						</div>
					) : null}
					{availableTabs.includes('skills') && openedTabs.includes('skills') ? (
						<div
							style={tab === 'skills' ? settingsOptionsPanel : hiddenPanel}
							className={VERTICAL_SCROLLBAR_CLASSNAME}
						>
							<SkillsSettings />
						</div>
					) : null}
					{openedTabs.includes('shortcuts') ? (
						<div
							style={tab === 'shortcuts' ? settingsOptionsPanel : hiddenPanel}
							className={VERTICAL_SCROLLBAR_CLASSNAME}
						>
							<KeyboardShortcutsSettings />
						</div>
					) : null}
					{availableTabs.includes('rendering') &&
					openedTabs.includes('rendering') ? (
						<div
							style={tab === 'rendering' ? settingsOptionsPanel : hiddenPanel}
							className={VERTICAL_SCROLLBAR_CLASSNAME}
						>
							<RenderingSettings />
						</div>
					) : null}
					{availableTabs.includes('studio') && openedTabs.includes('studio') ? (
						<div
							style={
								tab === 'studio' && studioPane === 'general'
									? settingsOptionsPanel
									: hiddenPanel
							}
							className={VERTICAL_SCROLLBAR_CLASSNAME}
						>
							<StudioSettings />
						</div>
					) : null}
					{availableTabs.includes('studio') && openedTabs.includes('studio') ? (
						<div
							style={
								tab === 'studio' && studioPane === 'elements'
									? settingsOptionsPanel
									: hiddenPanel
							}
							className={VERTICAL_SCROLLBAR_CLASSNAME}
						>
							<ElementLibrariesSettings />
						</div>
					) : null}
					{availableTabs.includes('updates') &&
					openedTabs.includes('updates') ? (
						<div
							style={tab === 'updates' ? settingsOptionsPanel : hiddenPanel}
							className={VERTICAL_SCROLLBAR_CLASSNAME}
						>
							<UpdatesSettings />
						</div>
					) : null}
				</div>
				{tab === 'packages' ? (
					<div ref={setPackagesFooterContainer} />
				) : !canEditConfig ||
				  tab === 'models' ||
				  tab === 'updates' ||
				  tab === 'skills' ? null : (
					<SettingsModalFooter
						showAboutElements={tab === 'studio' && studioPane === 'elements'}
						showLicenseFaq={tab === 'license'}
					/>
				)}
			</>
		</DismissableModal>
	);
};
