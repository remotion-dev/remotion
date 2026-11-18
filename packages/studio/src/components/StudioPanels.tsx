import React, {useCallback, useContext} from 'react';
import {SelectedModalContext, SetSelectedModalContext} from '../state/modals';
import {HigherZIndex} from '../state/z-index';
import {ElementLibraryModal} from './ElementLibraryModal';
import {MenuToolbar} from './MenuToolbar';
import {SettingsModal} from './SettingsModal';

const toolbar: React.CSSProperties = {
	flexShrink: 0,
};

const hiddenToolbar: React.CSSProperties = {
	visibility: 'hidden',
};

const content: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	flex: 1,
	minHeight: 0,
};

export const StudioPanels: React.FC<{
	readonly children: React.ReactNode;
	readonly readOnlyStudio: boolean;
}> = ({children, readOnlyStudio}) => {
	const selectedModal = useContext(SelectedModalContext);
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const library =
		selectedModal?.type === 'element-library'
			? selectedModal
			: selectedModal?.type === 'element-install' ||
				  selectedModal?.type === 'confirmation-dialog'
				? selectedModal.library
				: null;
	const panelOpen = selectedModal?.type === 'settings' || library !== null;
	const dismiss = useCallback(() => {
		setSelectedModal(null);
	}, [setSelectedModal]);
	return (
		<>
			<div style={toolbar}>
				<div
					inert={panelOpen}
					aria-hidden={panelOpen}
					style={panelOpen ? hiddenToolbar : undefined}
				>
					<MenuToolbar readOnlyStudio={readOnlyStudio} />
				</div>
				<HigherZIndex
					disabled={!panelOpen}
					onEscape={dismiss}
					onOutsideClick={null}
				>
					{selectedModal?.type === 'settings' ? (
						<SettingsModal
							key={`${selectedModal.initialTab}-${selectedModal.initialPublicLicenseKey}`}
							initialTab={selectedModal.initialTab}
							initialPublicLicenseKey={selectedModal.initialPublicLicenseKey}
						/>
					) : null}
					{library === null ? null : (
						<ElementLibraryModal
							name={library.name}
							url={library.url}
							installState={
								selectedModal?.type === 'element-install' ? selectedModal : null
							}
							confirmationState={
								selectedModal?.type === 'confirmation-dialog'
									? selectedModal
									: null
							}
						/>
					)}
				</HigherZIndex>
			</div>
			<div
				inert={panelOpen}
				aria-hidden={panelOpen}
				style={{...content, visibility: panelOpen ? 'hidden' : undefined}}
			>
				{children}
			</div>
		</>
	);
};
