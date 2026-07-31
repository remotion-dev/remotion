import {studioHtml} from '@remotion/studio-shared/studio-html';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
	createBrowserStudioHmrAssetManager,
	type BrowserStudioHmrBridge,
} from './browser-studio-hmr-assets';
import {createBrowserStudioOperations} from './browser-studio-operations';
import {
	areBrowserStudioProjectsEqual,
	createBrowserStudioPublicFileManager,
} from './browser-studio-project-controller';
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

// The host and iframe may use different studio-shared versions, so this
// handshake intentionally has no shared runtime import.
const BROWSER_STUDIO_OPERATIONS_READY_EVENT =
	'remotion-browser-studio-operations-ready';

const localStudioPreviewEntry = new URL(
	'./browser-studio-preview-entry.mjs',
	import.meta.url,
).href;

type BrowserStudioContentWindow = Window & {
	remotion_browserStudioHmr: BrowserStudioHmrBridge;
};

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
	const lastWrittenDocumentRef = useRef<Document | null>(null);
	const lastWrittenHtmlRef = useRef<string | null>(null);
	const workerRef = useRef<Worker | null>(null);
	const lastSentProjectRef = useRef<BrowserStudioProps['project'] | null>(null);
	const bundleUrlRef = useRef<string | null>(null);
	const onCompileStateChangeRef = useRef(onCompileStateChange);
	onCompileStateChangeRef.current = onCompileStateChange;
	const publicFileManager = useMemo(
		() =>
			createBrowserStudioPublicFileManager({
				createObjectUrl: null,
				revokeObjectUrl: null,
			}),
		[],
	);

	useEffect(() => {
		return () => publicFileManager.dispose();
	}, [publicFileManager]);
	const hmrAssetManager = useMemo(
		() =>
			createBrowserStudioHmrAssetManager({
				createObjectUrl: URL.createObjectURL,
				revokeObjectUrl: URL.revokeObjectURL,
			}),
		[],
	);
	useEffect(() => {
		return () => hmrAssetManager.dispose();
	}, [hmrAssetManager]);

	const [editedProject, setEditedProject] = useState<{
		project: BrowserStudioProps['project'];
		sourceProject: BrowserStudioProps['project'];
	} | null>(null);
	const incomingProjectMatchesEditSource =
		editedProject !== null &&
		areBrowserStudioProjectsEqual(editedProject.sourceProject, project);
	const activeProject =
		editedProject && incomingProjectMatchesEditSource
			? editedProject.project
			: project;
	const activeProjectRef = useRef(activeProject);
	activeProjectRef.current = activeProject;
	const incomingProjectRef = useRef(project);
	incomingProjectRef.current = project;
	const onProjectChangeRef = useRef(onProjectChange);
	onProjectChangeRef.current = onProjectChange;

	const updateProject = useCallback(
		(nextProject: BrowserStudioProps['project']) => {
			activeProjectRef.current = nextProject;
			setEditedProject({
				project: nextProject,
				sourceProject: incomingProjectRef.current,
			});
			onProjectChangeRef.current?.(nextProject);
		},
		[],
	);

	const browserStudioOperations = useMemo(
		() =>
			createBrowserStudioOperations({
				dependencyVersions: browserStudioDependencyVersions,
				getStaticFiles: publicFileManager.getStaticFiles,
				getProject: () => activeProjectRef.current,
				onProjectChange: updateProject,
			}),
		[publicFileManager, updateProject],
	);
	const previousIncomingProject = useRef(project);
	const incomingProjectAcknowledgesEdit =
		editedProject !== null &&
		areBrowserStudioProjectsEqual(editedProject.project, project);

	useEffect(() => {
		if (
			!areBrowserStudioProjectsEqual(
				previousIncomingProject.current,
				project,
			) &&
			!incomingProjectAcknowledgesEdit
		) {
			browserStudioOperations.resetHistory();
		}

		if (incomingProjectAcknowledgesEdit) {
			setEditedProject(null);
		}

		previousIncomingProject.current = project;
	}, [browserStudioOperations, incomingProjectAcknowledgesEdit, project]);

	useEffect(() => {
		setIframeLoaded(false);
		lastWrittenDocumentRef.current = null;
		lastWrittenHtmlRef.current = null;
	}, [iframeSrc]);

	useEffect(() => {
		let didCancel = false;

		const setCompileState = (nextState: CompileState) => {
			if (didCancel) {
				return;
			}

			setState(nextState);
			onCompileStateChangeRef.current?.(nextState);
		};

		setIframeHtml(null);
		setCompileState({status: 'compiling'});

		const worker = new Worker(
			new URL('./browser-studio-worker.mjs', import.meta.url),
			{type: 'module'},
		);
		workerRef.current = worker;
		lastSentProjectRef.current = activeProjectRef.current;

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

			if (response.type === 'building') {
				setCompileState({status: 'compiling'});
				return;
			}

			if (response.type === 'hmr-update') {
				hmrAssetManager.updateAssets(response.assets);
				browserStudioOperations.emitEvent({
					hmrEvent: response.hmrEvent,
					type: 'hmr',
				});
				setCompileState({status: 'compiled', warnings: response.warnings});
				return;
			}

			if (bundleUrlRef.current) {
				URL.revokeObjectURL(bundleUrlRef.current);
			}

			bundleUrlRef.current = URL.createObjectURL(
				new Blob([response.bundle], {type: 'text/javascript'}),
			);
			const currentProject = activeProjectRef.current;

			const html = studioHtml({
				audioLatencyHint: 'playback',
				bundleScriptUrl: bundleUrlRef.current,
				completedClientRenders: [],
				editorName: null,
				envVariables: {NODE_ENV: 'development'},
				gitSource: null,
				includeFavicon: true,
				inputProps: {},
				installedDependencies: null,
				logLevel: 'info',
				mode: 'dev',
				numberOfAudioTags: 0,
				packageManager: 'unknown',
				projectName: 'template-blank',
				publicFiles: publicFileManager.getStaticFiles({
					lastModifiedByPath: null,
					project: currentProject,
				}),
				publicFolderExists: null,
				fileSystemPlatform: null,
				publicPath: '',
				readOnlyStudio: readOnly,
				remotionRoot: currentProject.rootDir,
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
			type: 'init',
			dependencyResolutions: Object.fromEntries(
				Object.entries(browserStudioDependencyVersions).map(
					([name, version]) => {
						const customResolution = dependencyResolver?.({name, version});
						if (customResolution) {
							return [name, customResolution];
						}

						if (name === '@remotion/studio') {
							return [name, {url: localStudioPreviewEntry}];
						}

						return [name, null];
					},
				),
			),
			project: activeProjectRef.current,
		};

		worker.postMessage(request);

		return () => {
			didCancel = true;
			workerRef.current = null;
			lastSentProjectRef.current = null;
			worker.terminate();
		};
	}, [
		browserStudioOperations,
		dependencyResolver,
		hmrAssetManager,
		publicFileManager,
		readOnly,
		activeProject.entryPoint,
		activeProject.rootDir,
	]);

	useEffect(() => {
		const worker = workerRef.current;
		const lastSentProject = lastSentProjectRef.current;
		if (
			!worker ||
			!lastSentProject ||
			areBrowserStudioProjectsEqual(lastSentProject, activeProject)
		) {
			return;
		}

		lastSentProjectRef.current = activeProject;
		worker.postMessage({
			project: activeProject,
			type: 'update-project',
		} satisfies BrowserStudioWorkerCompileRequest);
	}, [activeProject]);

	useEffect(() => {
		browserStudioOperations.emitEvent({
			files: publicFileManager.getStaticFiles({
				lastModifiedByPath: null,
				project: activeProject,
			}),
			folderExists: '/public',
			type: 'new-public-folder',
		});
	}, [activeProject, browserStudioOperations, publicFileManager]);

	useEffect(() => {
		return () => {
			if (bundleUrlRef.current) {
				URL.revokeObjectURL(bundleUrlRef.current);
				bundleUrlRef.current = null;
			}
		};
	}, []);

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

		if (
			lastWrittenDocumentRef.current === contentDocument &&
			lastWrittenHtmlRef.current === iframeHtml
		) {
			return;
		}

		lastWrittenDocumentRef.current = contentDocument;
		lastWrittenHtmlRef.current = iframeHtml;

		contentDocument.open();
		(contentWindow as BrowserStudioContentWindow).remotion_browserStudioHmr =
			hmrAssetManager.bridge;
		contentWindow.remotion_browserStudio = browserStudioOperations;
		contentDocument.write(iframeHtml);
		contentDocument.close();

		const activeContentWindow = iframe.contentWindow;
		if (activeContentWindow) {
			(
				activeContentWindow as BrowserStudioContentWindow
			).remotion_browserStudioHmr = hmrAssetManager.bridge;
			activeContentWindow.remotion_browserStudio = browserStudioOperations;
			activeContentWindow.dispatchEvent(
				new Event(BROWSER_STUDIO_OPERATIONS_READY_EVENT),
			);
		}
	}, [
		browserStudioOperations,
		hmrAssetManager,
		iframeHtml,
		iframeLoaded,
		iframeSrc,
	]);

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
