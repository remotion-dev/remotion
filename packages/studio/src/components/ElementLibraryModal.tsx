import React, {useLayoutEffect, useRef} from 'react';
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
	flex: 1,
	minHeight: 0,
	width: '100%',
};

export const ElementLibraryModal: React.FC<{
	readonly name: string;
	readonly url: string;
}> = ({name, url}) => {
	const iframeRef = useRef<HTMLIFrameElement>(null);

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
		iframe.src = iframeUrl.toString();
	}, [url]);

	return (
		<DismissableModal panelStyle={panelStyle}>
			<ModalHeader title={name} />
			<iframe
				ref={iframeRef}
				allow="local-network-access; loopback-network"
				data-remotion-element-library=""
				style={iframeStyle}
				title={`${name} library`}
			/>
		</DismissableModal>
	);
};
