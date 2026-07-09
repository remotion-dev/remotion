import {studioHtml} from '@remotion/studio-shared/studio-html';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {browserStudioDependencyVersions} from './dependency-versions';
import {Spinner} from './Spinner';
import type {
	BrowserStudioProps,
	BrowserStudioWorkerCompileRequest,
	BrowserStudioWorkerCompileResponse,
	CompileState,
} from './types';

const makeInitialState = (): CompileState => ({
	status: 'idle',
});

const containerStyle: React.CSSProperties = {
	backgroundColor: '#111111',
	color: '#ffffff',
	height: '100%',
	minHeight: 480,
	position: 'relative',
	width: '100%',
};

const iframeStyle: React.CSSProperties = {
	border: 0,
	display: 'block',
	height: '100%',
	width: '100%',
};

const overlayStyle: React.CSSProperties = {
	alignItems: 'center',
	backgroundColor: '#111111',
	color: '#ffffff',
	display: 'flex',
	fontFamily: 'Arial, Helvetica, sans-serif',
	fontSize: 14,
	inset: 0,
	justifyContent: 'center',
	padding: 24,
	position: 'absolute',
	textAlign: 'center',
};

const errorStyle: React.CSSProperties = {
	...overlayStyle,
	alignItems: 'flex-start',
	fontFamily: 'monospace',
	justifyContent: 'flex-start',
	overflow: 'auto',
	textAlign: 'left',
	whiteSpace: 'pre-wrap',
};

const makeStaticFiles = (
	publicFiles: BrowserStudioProps['project']['publicFiles'],
) =>
	Object.entries(publicFiles ?? {}).map(([name, contents]) => ({
		lastModified: 0,
		name: name.replace(/^\//, ''),
		sizeInBytes:
			typeof contents === 'string'
				? new Blob([contents]).size
				: contents.length,
		src: `/public/${name.replace(/^\//, '')}`,
	}));

export const BrowserStudio: React.FC<BrowserStudioProps> = ({
	project,
	readOnly,
	iframeSrc,
	dependencyResolver,
	onCompileStateChange,
}) => {
	const [state, setState] = useState<CompileState>(makeInitialState);
	const [iframeHtml, setIframeHtml] = useState<string | null>(null);
	const [iframeLoaded, setIframeLoaded] = useState(false);
	const iframeRef = useRef<HTMLIFrameElement | null>(null);

	const projectKey = useMemo(() => JSON.stringify(project), [project]);

	useEffect(() => {
		let cleanupBundle: string | null = null;
		let didCancel = false;

		const setCompileState = (nextState: CompileState) => {
			if (didCancel) {
				return;
			}

			setState(nextState);
			onCompileStateChange?.(nextState);
		};

		setIframeHtml(null);
		setIframeLoaded(false);
		setCompileState({status: 'compiling'});

		const worker = new Worker(
			new URL('./browser-studio-worker.mjs', import.meta.url),
			{type: 'module'},
		);

		worker.onmessage = (
			event: MessageEvent<BrowserStudioWorkerCompileResponse>,
		) => {
			if (didCancel) {
				return;
			}

			const response = event.data;

			if (response.type === 'error') {
				setCompileState({status: 'error', error: response.error});
				return;
			}

			cleanupBundle = URL.createObjectURL(
				new Blob([response.bundle], {type: 'text/javascript'}),
			);

			const html = studioHtml({
				audioLatencyHint: 'playback',
				bundleScriptUrl: cleanupBundle,
				completedClientRenders: [],
				editorName: null,
				envVariables: {NODE_ENV: 'development'},
				gitSource: null,
				includeFavicon: false,
				inputProps: {},
				installedDependencies: null,
				logLevel: 'info',
				mode: 'dev',
				numberOfAudioTags: 0,
				packageManager: 'unknown',
				projectName: 'template-blank',
				publicFiles: makeStaticFiles(project.publicFiles),
				publicFolderExists: null,
				publicPath: '',
				readOnlyStudio: readOnly,
				remotionRoot: project.rootDir,
				renderDefaults: undefined,
				renderQueue: [],
				sampleRate: null,
				staticHash: '',
				studioServerCommand: null,
				title: 'Remotion Studio',
			});

			setIframeHtml(html);
			setCompileState({status: 'compiled', warnings: response.warnings});
		};

		worker.onerror = (event) => {
			setCompileState({
				status: 'error',
				error: {
					message: event.message,
				},
			});
		};

		const request: BrowserStudioWorkerCompileRequest = {
			type: 'compile',
			dependencyResolutions: dependencyResolver
				? Object.fromEntries(
						Object.entries(browserStudioDependencyVersions).map(
							([name, version]) => [name, dependencyResolver({name, version})],
						),
					)
				: {},
			project,
		};

		worker.postMessage(request);

		return () => {
			didCancel = true;
			worker.terminate();

			if (cleanupBundle) {
				URL.revokeObjectURL(cleanupBundle);
			}
		};
	}, [
		dependencyResolver,
		iframeSrc,
		onCompileStateChange,
		project,
		projectKey,
		readOnly,
	]);

	useEffect(() => {
		if (!iframeHtml) {
			return;
		}

		if (iframeSrc && !iframeLoaded) {
			return;
		}

		const iframe = iframeRef.current;
		const contentDocument = iframe?.contentDocument;
		if (!contentDocument) {
			return;
		}

		contentDocument.open();
		contentDocument.write(iframeHtml);
		contentDocument.close();
	}, [iframeHtml, iframeLoaded, iframeSrc]);

	return (
		<div style={containerStyle}>
			{iframeHtml ? (
				<iframe
					ref={iframeRef}
					allow="cross-origin-isolated"
					onLoad={() => setIframeLoaded(true)}
					sandbox="allow-scripts allow-same-origin allow-downloads"
					src={iframeSrc ?? 'about:blank'}
					style={iframeStyle}
					title="Remotion Studio"
				/>
			) : null}
			{state.status === 'compiling' ? (
				<div style={overlayStyle}>
					<Spinner duration={0.5} size={14} />
				</div>
			) : null}
			{state.status === 'error' ? (
				<pre style={errorStyle}>
					{state.error.message}
					{state.error.diagnostics?.length
						? `\n\n${state.error.diagnostics.join('\n')}`
						: ''}
				</pre>
			) : null}
		</div>
	);
};
