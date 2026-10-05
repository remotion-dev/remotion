import React, {useCallback, useContext} from 'react';
import {GearIcon} from '../icons/gear';
import {
	type ElementInstallModalState,
	SetSelectedModalContext,
} from '../state/modals';
import {ActionTooltip} from './ActionTooltip';
import {ElementInstallConfirmation} from './ElementInstallConfirmation';
import {ElementLibraryFrame} from './ElementLibraryFrame';
import type {RenderInlineAction} from './InlineAction';
import {InlineAction} from './InlineAction';
import {getMaxModalHeight, getMaxModalWidth} from './ModalContainer';
import {ModalHeader} from './ModalHeader';
import {DismissableModal} from './NewComposition/DismissableModal';

const panelStyle: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	height: getMaxModalHeight(1000),
	overflow: 'hidden',
	width: getMaxModalWidth(1400),
};

export const ElementLibraryModal: React.FC<{
	readonly name: string;
	readonly url: string;
	readonly installState: ElementInstallModalState | null;
}> = ({name, url, installState}) => {
	const {setSelectedModal} = useContext(SetSelectedModalContext);
	const openElementSettings = useCallback(() => {
		setSelectedModal({
			type: 'settings',
			initialStudioPane: 'elements',
			initialTab: 'studio',
			initialPublicLicenseKey:
				window.remotion_renderDefaults?.publicLicenseKey ?? null,
		});
	}, [setSelectedModal]);
	const renderGearIcon: RenderInlineAction = useCallback((color) => {
		return <GearIcon color={color} height={16} width={16} />;
	}, []);

	return (
		<DismissableModal panelStyle={panelStyle}>
			<ModalHeader
				title={name}
				rightAction={
					<ActionTooltip
						label="Configure Elements"
						shortcut={null}
						delay={800}
						dismissOnClick
					>
						<InlineAction
							aria-label="Configure Element Libraries"
							onClick={openElementSettings}
							renderAction={renderGearIcon}
							variant="modal-header"
						/>
					</ActionTooltip>
				}
			/>
			<ElementLibraryFrame name={name} url={url} />
			{installState === null ? null : (
				<ElementInstallConfirmation state={installState} />
			)}
		</DismissableModal>
	);
};
