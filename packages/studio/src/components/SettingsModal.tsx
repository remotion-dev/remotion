import React, {useCallback, useContext, useState} from 'react';
import {AppsIcon} from '../icons/apps';
import {CertificateIcon} from '../icons/certificate';
import {SetSelectedModalContext} from '../state/modals';
import {DefaultEditorSettings} from './ConfigureDefaultEditorModal';
import {LicenseSettings} from './ConfigureLicenseModal';
import {VERTICAL_SCROLLBAR_CLASSNAME} from './Menu/is-menu-item';
import {ModalHeader} from './ModalHeader';
import {DismissableModal} from './NewComposition/DismissableModal';
import {
	horizontalLayout,
	horizontalTab,
	icon,
	iconContainer,
	leftSidebar,
	optionsPanel,
	outerModalStyle,
} from './RenderModal/render-modals';
import {VerticalTab} from './Tabs/vertical';

type SettingsTab = 'apps' | 'license';

const hiddenPanel: React.CSSProperties = {
	display: 'none',
};

const appsIcon: React.CSSProperties = {
	...icon,
	height: 20,
	width: 20,
};

const appsIconContainer: React.CSSProperties = {
	...iconContainer,
	height: 20,
	width: 20,
};

export const SettingsModal: React.FC<{
	readonly initialTab: SettingsTab;
	readonly initialPublicLicenseKey: string | null;
}> = ({initialPublicLicenseKey, initialTab}) => {
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const [tab, setTab] = useState<SettingsTab>(initialTab);
	const [openedTabs, setOpenedTabs] = useState<SettingsTab[]>([initialTab]);

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

	return (
		<DismissableModal panelStyle={outerModalStyle}>
			<ModalHeader title="Settings" onClose={dismiss} />
			<div style={horizontalLayout}>
				<div style={leftSidebar}>
					<VerticalTab
						style={horizontalTab}
						selected={tab === 'apps'}
						onClick={() => selectTab('apps')}
						renderIcon={(color) => (
							<div style={appsIconContainer}>
								<AppsIcon color={color} style={appsIcon} />
							</div>
						)}
					>
						Apps
					</VerticalTab>
					<VerticalTab
						style={horizontalTab}
						selected={tab === 'license'}
						onClick={() => selectTab('license')}
						renderIcon={(color) => (
							<div style={iconContainer}>
								<CertificateIcon color={color} style={icon} />
							</div>
						)}
					>
						License
					</VerticalTab>
				</div>
				{openedTabs.includes('apps') ? (
					<div
						style={tab === 'apps' ? optionsPanel : hiddenPanel}
						className={VERTICAL_SCROLLBAR_CLASSNAME}
					>
						<DefaultEditorSettings onSaved={dismiss} />
					</div>
				) : null}
				{openedTabs.includes('license') ? (
					<div
						style={tab === 'license' ? optionsPanel : hiddenPanel}
						className={VERTICAL_SCROLLBAR_CLASSNAME}
					>
						<LicenseSettings
							initialPublicLicenseKey={initialPublicLicenseKey}
							onSaved={dismiss}
						/>
					</div>
				) : null}
			</div>
		</DismissableModal>
	);
};
