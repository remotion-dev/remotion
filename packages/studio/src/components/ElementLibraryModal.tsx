import React, {
	useCallback,
	useContext,
	useLayoutEffect,
	useRef,
	useState,
} from 'react';
import {GearIcon} from '../icons/gear';
import {
	type ElementInstallModalState,
	SetSelectedModalContext,
} from '../state/modals';
import {ActionTooltip} from './ActionTooltip';
import {ElementInstallConfirmation} from './ElementInstallConfirmation';
import type {RenderInlineAction} from './InlineAction';
import {InlineAction} from './InlineAction';
import {getMaxModalHeight, getMaxModalWidth} from './ModalContainer';
import {ModalHeader} from './ModalHeader';
import {DismissableModal} from './NewComposition/DismissableModal';
import {Spinner} from './Spinner';

const panelStyle: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	height: getMaxModalHeight(1000),
	overflow: 'hidden',
	width: getMaxModalWidth(1400),
};

const contentStyle: React.CSSProperties = {
	flex: 1,
	minHeight: 0,
	position: 'relative',
};

const iframeStyle: React.CSSProperties = {
	border: 0,
	colorScheme: 'dark',
	height: '100%',
	inset: 0,
	position: 'absolute',
	width: '100%',
};

const loadingStyle: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	inset: 0,
	justifyContent: 'center',
	position: 'absolute',
};

export const ElementLibraryModal: React.FC<{
	readonly name: string;
	readonly url: string;
	readonly installState: ElementInstallModalState | null;
}> = ({name, url, installState}) => {
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const [isLoaded, setIsLoaded] = useState(false);
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

		setIsLoaded(false);
		const onLoad = () => setIsLoaded(true);
		iframe.addEventListener('load', onLoad);

		// Studio is cross-origin isolated. A credentialless iframe may embed a
		// library that does not set Cross-Origin-Resource-Policy headers.
		iframe.setAttribute('credentialless', '');
		const iframeUrl = new URL(url);
		iframeUrl.searchParams.set('remotion-studio', 'true');
		iframeUrl.searchParams.set('docusaurus-theme', 'dark');
		iframe.src = iframeUrl.toString();

		return () => {
			iframe.removeEventListener('load', onLoad);
		};
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
			<div style={contentStyle}>
				<iframe
					ref={iframeRef}
					allow="local-network-access; loopback-network"
					data-remotion-element-library=""
					style={{
						...iframeStyle,
						visibility: isLoaded ? 'visible' : 'hidden',
					}}
					aria-label={`${name} library`}
				/>
				{isLoaded ? null : (
					<div
						style={loadingStyle}
						role="status"
						aria-label={`Loading ${name}`}
					>
						<Spinner duration={0.5} size={24} />
					</div>
				)}
			</div>
			{installState === null ? null : (
				<ElementInstallConfirmation state={installState} />
			)}
		</DismissableModal>
	);
};
