import React, {useLayoutEffect, useRef, useState} from 'react';
import {Spinner} from './Spinner';

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

export const ElementLibraryFrame: React.FC<{
	readonly name: string;
	readonly url: string;
}> = ({name, url}) => {
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const [isLoaded, setIsLoaded] = useState(false);

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
				<div style={loadingStyle} role="status" aria-label={`Loading ${name}`}>
					<Spinner duration={0.5} size={24} />
				</div>
			)}
		</div>
	);
};
