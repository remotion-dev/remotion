import React, {useCallback, useContext, useLayoutEffect, useRef} from 'react';
import {GearIcon} from '../icons/gear';
import {SetSelectedModalContext} from '../state/modals';
import {ActionTooltip} from './ActionTooltip';
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

const iframeStyle: React.CSSProperties = {
	border: 0,
	colorScheme: 'dark',
	flex: 1,
	minHeight: 0,
	width: '100%',
};

export const ElementLibraryModal: React.FC<{
	readonly name: string;
	readonly url: string;
}> = ({name, url}) => {
	const iframeRef = useRef<HTMLIFrameElement>(null);
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

	useLayoutEffect(() => {
		const iframe = iframeRef.current;
		if (iframe === null) {
			return;
		}

		// Studio is cross-origin isolated. A credentialless iframe may embed a
		// library that does not set Cross-Origin-Resource-Policy headers.
		iframe.setAttribute('credentialless', '');
		const iframeUrl = new URL(url);
		iframeUrl.searchParams.set('remotion-studio', 'true');
		iframeUrl.searchParams.set('docusaurus-theme', 'dark');
		iframe.src = iframeUrl.toString();
	}, [url]);

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
			<iframe
				ref={iframeRef}
				allow="local-network-access; loopback-network"
				data-remotion-element-library=""
				style={iframeStyle}
				aria-label={`${name} library`}
			/>
		</DismissableModal>
	);
};
