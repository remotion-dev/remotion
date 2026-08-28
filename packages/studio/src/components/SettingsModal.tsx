import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
	canInstallPackages,
	getBrowserStudioOperations,
} from '../helpers/browser-studio-operations';
import {AppsIcon} from '../icons/apps';
import {CloudDownloadIcon} from '../icons/cloud-download';
import {KeyboardIcon} from '../icons/keyboard';
import {LicenseIcon} from '../icons/license';
import {PackageIcon} from '../icons/package';
import {RemotionTriangleIcon} from '../icons/remotion-triangle';
import {SkillsIcon} from '../icons/skills';
import {FilmIcon} from '../icons/video';
import {SetSelectedModalContext} from '../state/modals';
import {DefaultEditorSettings} from './ConfigureDefaultEditorModal';
import {LicenseSettings} from './ConfigureLicenseModal';
import {InstallPackageSettings} from './InstallPackage';
import {KeyboardShortcutsSettings} from './KeyboardShortcutsSettings';
import {VERTICAL_SCROLLBAR_CLASSNAME} from './Menu/is-menu-item';
import {ModalHeader} from './ModalHeader';
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

type SettingsTab =
	| 'apps'
	| 'rendering'
	| 'studio'
	| 'packages'
	| 'shortcuts'
	| 'skills'
	| 'license'
	| 'updates';

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

export const SettingsModal: React.FC<{
	readonly initialTab: SettingsTab;
	readonly initialPublicLicenseKey: string | null;
}> = ({initialPublicLicenseKey, initialTab}) => {
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const {setPublicLicenseKey} = useSettings();
	const isBrowserStudio = getBrowserStudioOperations() !== null;
	const packageManager =
		window.remotion_packageManager === 'unknown'
			? null
			: window.remotion_packageManager;
	const showPackages =
		canInstallPackages() && (isBrowserStudio || packageManager !== null);
	const [tab, setTab] = useState<SettingsTab>(initialTab);
	const [openedTabs, setOpenedTabs] = useState<SettingsTab[]>([initialTab]);
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
	useEffect(() => {
		setPublicLicenseKey(initialPublicLicenseKey);
	}, [initialPublicLicenseKey, setPublicLicenseKey]);

	return (
		<DismissableModal panelStyle={outerModalStyle}>
			<>
				<ModalHeader title="Settings" onClose={dismiss} />
				<div style={horizontalLayout}>
					<div style={settingsLeftSidebar}>
						{isBrowserStudio ? null : (
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
						)}
						{isBrowserStudio ? null : (
							<VerticalTab
								style={horizontalTab}
								selected={tab === 'studio'}
								onClick={() => selectTab('studio')}
								renderIcon={(color) => (
									<div style={iconContainer}>
										<RemotionTriangleIcon color={color} style={icon} />
									</div>
								)}
							>
								Studio
							</VerticalTab>
						)}
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
						{showPackages ? (
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
						{isBrowserStudio ? null : (
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
						)}
						{isBrowserStudio ? null : (
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
						)}
						{isBrowserStudio ? null : (
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
						)}
						{isBrowserStudio ? null : (
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
						)}
					</div>
					{openedTabs.includes('packages') ? (
						<div style={tab === 'packages' ? optionsPanel : hiddenPanel}>
							<InstallPackageSettings
								footerContainer={packagesFooterContainer}
								packageManager={packageManager}
							/>
						</div>
					) : null}
					{openedTabs.includes('apps') ? (
						<div
							style={tab === 'apps' ? settingsOptionsPanel : hiddenPanel}
							className={VERTICAL_SCROLLBAR_CLASSNAME}
						>
							<DefaultEditorSettings />
						</div>
					) : null}
					{openedTabs.includes('license') ? (
						<div
							style={tab === 'license' ? settingsOptionsPanel : hiddenPanel}
							className={VERTICAL_SCROLLBAR_CLASSNAME}
						>
							<LicenseSettings />
						</div>
					) : null}
					{openedTabs.includes('skills') ? (
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
					{openedTabs.includes('rendering') ? (
						<div
							style={tab === 'rendering' ? settingsOptionsPanel : hiddenPanel}
							className={VERTICAL_SCROLLBAR_CLASSNAME}
						>
							<RenderingSettings />
						</div>
					) : null}
					{openedTabs.includes('studio') ? (
						<div
							style={tab === 'studio' ? settingsOptionsPanel : hiddenPanel}
							className={VERTICAL_SCROLLBAR_CLASSNAME}
						>
							<StudioSettings />
						</div>
					) : null}
					{openedTabs.includes('updates') ? (
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
				) : isBrowserStudio || tab === 'updates' ? null : (
					<SettingsModalFooter showLicenseFaq={tab === 'license'} />
				)}
			</>
		</DismissableModal>
	);
};
