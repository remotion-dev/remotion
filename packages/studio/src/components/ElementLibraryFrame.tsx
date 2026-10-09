import {
	StudioProtocolInternals,
	type StudioCaptionStyleSelection,
} from '@remotion/studio-protocol';
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
	readonly context: 'captions' | null;
	readonly captionStyleSelection: StudioCaptionStyleSelection;
}> = ({name, url, context, captionStyleSelection}) => {
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const selectionPortRef = useRef<MessagePort | null>(null);
	const selectionMessageRef = useRef({
		operation: 'caption-style-selection',
		protocol: 'remotion-studio-protocol',
		protocolVersion: 1,
		selection: captionStyleSelection,
	});
	selectionMessageRef.current.selection = captionStyleSelection;
	const [isLoaded, setIsLoaded] = useState(false);

	useLayoutEffect(() => {
		const iframe = iframeRef.current;
		if (iframe === null) {
			return;
		}

		setIsLoaded(false);
		const onLoad = () => setIsLoaded(true);
		iframe.addEventListener('load', onLoad);

		const onMessage = (event: MessageEvent) => {
			if (
				context !== 'captions' ||
				event.source !== iframe.contentWindow ||
				!StudioProtocolInternals.isAllowedStudioProtocolPageOrigin(
					event.origin,
				) ||
				!StudioProtocolInternals.isStudioProtocolCaptionStyleSubscription(
					event.data,
				)
			) {
				return;
			}

			const port = event.ports[0];
			if (port === undefined) {
				return;
			}

			selectionPortRef.current?.close();
			selectionPortRef.current = port;
			port.onmessage = (message) => {
				// The library sends null when its subscription ends.
				if (message.data === null) {
					port.close();
					if (selectionPortRef.current === port) {
						selectionPortRef.current = null;
					}
				}
			};

			port.postMessage(selectionMessageRef.current);
		};

		window.addEventListener('message', onMessage);

		// Studio is cross-origin isolated. A credentialless iframe may embed a
		// library that does not set Cross-Origin-Resource-Policy headers.
		iframe.setAttribute('credentialless', '');
		const iframeUrl = new URL(url);
		iframeUrl.searchParams.set('remotion-studio', 'true');
		if (context === null) {
			iframeUrl.searchParams.delete('remotion-studio-context');
		} else {
			iframeUrl.searchParams.set('remotion-studio-context', context);
		}

		iframeUrl.searchParams.set('docusaurus-theme', 'dark');
		iframe.src = iframeUrl.toString();

		return () => {
			iframe.removeEventListener('load', onLoad);
			window.removeEventListener('message', onMessage);
			selectionPortRef.current?.close();
			selectionPortRef.current = null;
		};
	}, [context, url]);

	useLayoutEffect(() => {
		selectionPortRef.current?.postMessage(selectionMessageRef.current);
	}, [captionStyleSelection]);

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
