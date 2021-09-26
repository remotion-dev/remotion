import React, {useState} from 'react';
import {createPortal} from 'react-dom';

export const IFrameWrapper: React.FC<{
	width: number;
	height: number;
}> = ({children, width, height, ...props}) => {
	const [contentRef, setContentRef] = useState<HTMLIFrameElement>(null);
	const mountNode = contentRef?.contentWindow?.document?.body;

	return (
		<iframe
			style={{
				position: 'absolute',
				width,
				height,
				border: 'none',
			}}
			id="IframeWrapper"
			{...props}
			ref={setContentRef}
		>
			{mountNode && createPortal(children, mountNode)}
		</iframe>
	);
};
