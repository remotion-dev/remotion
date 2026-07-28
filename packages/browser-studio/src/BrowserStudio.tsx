import {studioHtml} from '@remotion/studio-shared/studio-html';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {createBrowserStudioOperations} from './browser-studio-operations';
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

const localStudioRenderEntry = new URL(
	'./browser-studio-render-entry.mjs',
	import.meta.url,
).href;

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
	onProjectChange,
}) => {
	const [state, setState] = useState<CompileState>(makeInitialState);
	const [iframeHtml, setIframeHtml] = useState<string | null>(null);
	const [iframeLoaded, setIframeLoaded] = useState(false);
	const iframeRef = useRef<HTMLIFrameElement | null>(null);

	const incomingProjectKey = useMemo(() => JSON.stringify(project), [project]);
	const [editedProject, setEditedProject] = useState<{
		project: BrowserStudioProps['project'];
		sourceKey: string;
	} | null>(null);
	const activeProject =
		editedProject?.sourceKey === incomingProjectKey
			? editedProject.project
			: project;
	const activeProjectRef = useRef(activeProject);
	activeProjectRef.current = activeProject;

	const updateProject = useCallback(
		(nextProject: BrowserStudioProps['project']) => {
			activeProjectRef.current = nextProject;
			setEditedProject({
				project: nextProject,
				sourceKey: incomingProjectKey,
			});
			onProjectChange?.(nextProject);
		},
		[incomingProjectKey, onProjectChange],
	);

	const browserStudioOperations = useMemo(
		() =>
			createBrowserStudioOperations({
				getProject: () => activeProjectRef.current,
				onProjectChange: updateProject,
			}),
		[updateProject],
	);

	useEffect(() => {
		setIframeLoaded(false);
	}, [iframeSrc]);

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
				publicFiles: makeStaticFiles(activeProject.publicFiles),
				publicFolderExists: null,
				fileSystemPlatform: null,
				publicPath: '',
				readOnlyStudio: readOnly,
				remotionRoot: activeProject.rootDir,
				renderDefaults: undefined,
				renderQueue: [],
				sampleRate: null,
				staticHash: '',
				studioRuntimeConfig: {
					askAIEnabled: false,
					bufferStateDelayInMilliseconds: null,
					interactivityEnabled: true,
					keyboardShortcutsEnabled: true,
					maxTimelineTracks: null,
				},
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
			dependencyResolutions: Object.fromEntries(
				Object.entries(browserStudioDependencyVersions).map(
					([name, version]) => {
						const customResolution = dependencyResolver?.({name, version});
						if (customResolution) {
							return [name, customResolution];
						}

						if (name === '@remotion/studio') {
							return [name, {url: localStudioRenderEntry}];
						}

						return [name, null];
					},
				),
			),
			project: activeProject,
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
		activeProject,
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
		const contentWindow = iframe?.contentWindow;
		const contentDocument = iframe?.contentDocument;
		if (!contentWindow || !contentDocument) {
			return;
		}

		contentDocument.open();
		contentDocument.write(iframeHtml);
		contentWindow.remotion_browserStudio = browserStudioOperations;
		contentDocument.close();
	}, [browserStudioOperations, iframeHtml, iframeLoaded, iframeSrc]);

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
			{state.status === 'compiling' && iframeHtml === null ? (
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
