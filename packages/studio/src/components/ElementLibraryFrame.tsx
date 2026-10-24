import {
	StudioProtocolInternals,
	type StudioCaptionStyleSelection,
} from '@remotion/studio-protocol';
import React, {useCallback, useLayoutEffect, useRef, useState} from 'react';
import {LIGHT_TEXT, WHITE} from '../helpers/colors';
import {ModalButton} from './ModalButton';
import {Spinner} from './Spinner';

const LOAD_TIMEOUT = 15_000;

// COEP reports are not covered by the DOM typings. Chromium exposes their
// fields through toJSON(), rather than directly on ReportBody.
type CoepReportBody = {
	toJSON: () => {
		disposition: string;
		blockedURL: string;
	};
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

const errorStyle: React.CSSProperties = {
	...loadingStyle,
	flexDirection: 'column',
	gap: 12,
	overflowY: 'auto',
	padding: 24,
	textAlign: 'center',
};

const errorTitleStyle: React.CSSProperties = {
	color: WHITE,
	fontSize: 16,
	fontWeight: 600,
};

const errorDescriptionStyle: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 14,
	lineHeight: 1.5,
	maxWidth: 500,
	overflowWrap: 'anywhere',
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
	const [loadState, setLoadState] = useState<'loading' | 'loaded' | 'error'>(
		'loading',
	);
	const [error, setError] = useState<'timeout' | 'coep' | null>(null);
	const [attempt, setAttempt] = useState(0);
	const retry = useCallback(() => {
		setAttempt((previous) => previous + 1);
	}, []);

	useLayoutEffect(() => {
		const iframe = iframeRef.current;
		if (iframe === null) {
			return;
		}

		setLoadState('loading');
		setError(null);
		let disposed = false;
		let blocked = false;
		const iframeUrl = new URL(url);
		iframeUrl.searchParams.set('remotion-studio', 'true');
		if (context === null) {
			iframeUrl.searchParams.delete('remotion-studio-context');
		} else {
			iframeUrl.searchParams.set('remotion-studio-context', context);
		}

		iframeUrl.searchParams.set('docusaurus-theme', 'dark');

		const timeout = window.setTimeout(() => {
			setError('timeout');
			setLoadState('error');
		}, LOAD_TIMEOUT);
		// `load` can also fire for a browser error page. COEP reports may
		// arrive afterward and must still be allowed to show the error screen.
		const onLoad = () => {
			if (blocked) {
				return;
			}

			window.clearTimeout(timeout);
			setError(null);
			setLoadState('loaded');
		};

		iframe.addEventListener('load', onLoad);
		const observer =
			typeof ReportingObserver === 'undefined'
				? null
				: new ReportingObserver(
						(reports) => {
							if (disposed) {
								return;
							}

							for (const report of reports) {
								if (report.type !== 'coep' || !report.body) {
									continue;
								}

								const body = (report.body as CoepReportBody).toJSON();
								if (
									body.disposition !== 'enforce' ||
									body.blockedURL !== iframeUrl.href
								) {
									continue;
								}

								blocked = true;
								window.clearTimeout(timeout);
								setError('coep');
								setLoadState('error');
							}
						},
						// Do not replay reports from a previous attempt after Retry.
						{types: ['coep'], buffered: false},
					);
		observer?.observe();

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

		// In supporting browsers, credentialless allows embedding libraries
		// without COEP headers. Other browsers require the library to set a
		// compatible Cross-Origin-Embedder-Policy itself.
		iframe.setAttribute('credentialless', '');
		iframe.src = iframeUrl.toString();

		return () => {
			disposed = true;
			window.clearTimeout(timeout);
			observer?.disconnect();
			iframe.removeEventListener('load', onLoad);
			window.removeEventListener('message', onMessage);
			selectionPortRef.current?.close();
			selectionPortRef.current = null;
		};
	}, [attempt, context, url]);

	useLayoutEffect(() => {
		selectionPortRef.current?.postMessage(selectionMessageRef.current);
	}, [captionStyleSelection]);

	return (
		<div style={contentStyle}>
			<iframe
				key={`${url}-${context}-${attempt}`}
				ref={iframeRef}
				allow="local-network-access; loopback-network"
				data-remotion-element-library=""
				style={{
					...iframeStyle,
					visibility: loadState === 'loaded' ? 'visible' : 'hidden',
				}}
				aria-label={`${name} library`}
			/>
			{loadState === 'loading' ? (
				<div style={loadingStyle} role="status" aria-label={`Loading ${name}`}>
					<Spinner duration={0.5} size={24} />
				</div>
			) : null}
			{loadState === 'error' ? (
				<div style={errorStyle}>
					<div role="alert">
						<div style={errorTitleStyle}>Could not load {name}</div>
						<div style={errorDescriptionStyle}>{url}</div>
						<div style={errorDescriptionStyle}>
							{error === 'coep'
								? 'Your browser blocked this library because of Cross-Origin-Embedder-Policy. Check the browser console for details.'
								: 'The library did not finish loading within 15 seconds. Check your connection and try again. The browser console may have more details.'}
						</div>
					</div>
					<ModalButton onClick={retry}>Retry</ModalButton>
				</div>
			) : null}
		</div>
	);
};
