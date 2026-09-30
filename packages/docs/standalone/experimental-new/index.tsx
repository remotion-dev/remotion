import {
	BrowserStudio,
	createBlankTemplateProject,
	loadGitHubRepository,
	type LoadGitHubRepositoryProgress,
	type VirtualProject,
} from '@remotion/browser-studio';
import {StudioProtocolInternals} from '@remotion/studio-protocol';
import React, {useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';

declare const __BROWSER_STUDIO_WORKSPACE_COMMIT__: string;

const experimentalNoticeStorageKey =
	'remotion-browser-studio-experimental-notice-acknowledged';

const page: React.CSSProperties = {
	backgroundColor: '#111111',
	color: '#ffffff',
	height: '100dvh',
	inset: 0,
	overflow: 'hidden',
	position: 'fixed',
	width: '100vw',
};

const fallback: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	fontFamily: 'Arial, Helvetica, sans-serif',
	height: '100%',
	justifyContent: 'center',
	width: '100%',
};

const loadingBackdrop: React.CSSProperties = {
	...fallback,
	backgroundColor: '#111111',
	color: '#ffffff',
	padding: 24,
};

const loadingDialog: React.CSSProperties = {
	backgroundColor: '#1f1f1f',
	border: '1px solid #3a3a3a',
	borderRadius: 8,
	boxShadow: '0 16px 60px rgba(0, 0, 0, 0.5)',
	boxSizing: 'border-box',
	color: '#ffffff',
	maxWidth: 480,
	padding: 24,
	width: '100%',
};

const progressBar: React.CSSProperties = {
	accentColor: '#0b84f3',
	display: 'block',
	height: 8,
	marginTop: 20,
	width: '100%',
};

type InitialElementState =
	| {type: 'none'}
	| {type: 'invalid'}
	| {
			type: 'payload';
			payload: NonNullable<
				React.ComponentProps<typeof BrowserStudio>['initialElement']
			>;
	  };

type ProjectState =
	| {type: 'ready'; project: VirtualProject}
	| {
			type: 'loading';
			repoUrl: string;
			progress: LoadGitHubRepositoryProgress;
	  }
	| {type: 'error'; repoUrl: string; message: string};

const getInitialProjectState = (): ProjectState => {
	const repoUrl = new URLSearchParams(window.location.search).get('repo');
	if (!repoUrl) {
		return {type: 'ready', project: createBlankTemplateProject()};
	}

	return {
		type: 'loading',
		repoUrl,
		progress: {phase: 'reading-repository'},
	};
};

const getInitialElementState = (): InitialElementState => {
	const hasPayload = new URLSearchParams(window.location.hash.slice(1)).has(
		'remotion-browser-studio',
	);
	if (!hasPayload) {
		return {type: 'none'};
	}

	const payload = StudioProtocolInternals.parseBrowserStudioHash(
		window.location.hash,
	);
	if (payload === null) {
		return {type: 'invalid'};
	}

	let sourceOrigin: string | null = null;
	try {
		sourceOrigin = document.referrer ? new URL(document.referrer).origin : null;
	} catch {
		sourceOrigin = null;
	}

	return {type: 'payload', payload: {payload, sourceOrigin}};
};

const BrowserStudioContent: React.FC = () => {
	const [initialElementState] = useState(getInitialElementState);
	const [projectState, setProjectState] = useState(getInitialProjectState);
	const [noticeAcknowledged, setNoticeAcknowledged] = useState(() => {
		try {
			return (
				window.localStorage.getItem(experimentalNoticeStorageKey) === 'true'
			);
		} catch {
			return false;
		}
	});
	const [noticeKeyboardNavigation, setNoticeKeyboardNavigation] =
		useState(false);
	const noticeRef = useRef<HTMLDialogElement>(null);
	const noticeButtonRef = useRef<HTMLButtonElement>(null);
	const loadingRepoUrl =
		projectState.type === 'loading' ? projectState.repoUrl : null;

	useEffect(() => {
		const dialog = noticeRef.current;
		if (!dialog || noticeAcknowledged) {
			return;
		}

		dialog.showModal();
		noticeButtonRef.current?.focus();
		return () => dialog.close();
	}, [noticeAcknowledged]);

	useEffect(() => {
		if (initialElementState.type === 'none') {
			return;
		}

		window.history.replaceState(
			null,
			'',
			`${window.location.pathname}${window.location.search}`,
		);
	}, [initialElementState.type]);

	useEffect(() => {
		if (loadingRepoUrl === null) {
			return;
		}

		const controller = new AbortController();
		loadGitHubRepository({
			onProgress: (progress) => {
				setProjectState((currentState) =>
					currentState.type === 'loading'
						? {...currentState, progress}
						: currentState,
				);
			},
			repoUrl: loadingRepoUrl,
			signal: controller.signal,
		})
			.then((project) => setProjectState({type: 'ready', project}))
			.catch((error: unknown) => {
				if (controller.signal.aborted) {
					return;
				}

				setProjectState({
					message: error instanceof Error ? error.message : String(error),
					repoUrl: loadingRepoUrl,
					type: 'error',
				});
			});

		return () => controller.abort();
	}, [loadingRepoUrl]);

	if (initialElementState.type === 'invalid') {
		return <div style={fallback}>Invalid Browser Studio payload.</div>;
	}

	if (!noticeAcknowledged) {
		return (
			<div style={{...loadingBackdrop, boxSizing: 'border-box'}}>
				<style>{`
					.experimental-notice.css-reset,
					.experimental-notice.css-reset * {
						font-size: 16px;
						line-height: 1.5;
						color: white;
						font-family: Arial, Helvetica, sans-serif;
						background: transparent;
						box-sizing: border-box;
					}
					.experimental-notice .experimental-notice-copy,
					.experimental-notice .experimental-notice-copy * {
						font-size: 14px;
						color: #a6a7a9;
					}
					.experimental-notice-control {
						cursor: default;
					}
					@media (hover: hover) {
						.experimental-notice .experimental-notice-link:hover {
							color: white;
						}
					}
					.experimental-notice-control:focus {
						outline: none;
						box-shadow: none;
					}
					.experimental-notice[data-keyboard-navigation="true"] .experimental-notice-control:focus-visible {
						box-shadow: inset 1px 1px #555, inset -1px -1px #555,
							inset 1px -1px #555, inset -1px 1px #555;
					}
				`}</style>
				<dialog
					ref={noticeRef}
					className="experimental-notice css-reset"
					aria-labelledby="experimental-notice-title"
					aria-describedby="experimental-notice-description"
					data-keyboard-navigation={noticeKeyboardNavigation}
					onCancel={(event) => event.preventDefault()}
					onKeyDown={(event) => {
						if (event.key === 'Tab') {
							setNoticeKeyboardNavigation(true);
						}
					}}
					style={{
						...loadingDialog,
						backgroundColor: 'rgb(31, 36, 40)',
						maxHeight: 'calc(100dvh - 48px)',
						width: 'calc(100vw - 48px)',
					}}
				>
					<h1
						id="experimental-notice-title"
						style={{fontSize: 18, fontWeight: 600, margin: 0}}
					>
						Browser Studio is experimental
					</h1>
					<div
						id="experimental-notice-description"
						className="experimental-notice-copy"
					>
						<p>
							This is a playground for trying Remotion’s editing features.
							Projects aren’t saved between visits, and AI interaction isn’t
							available here as it is in the{' '}
							<a
								className="experimental-notice-control experimental-notice-link"
								href="https://www.remotion.dev/docs/studio/studio"
								rel="noopener noreferrer"
								target="_blank"
							>
								regular Remotion Studio
							</a>
							.
						</p>
						<p>
							To keep working on your project, use{' '}
							<strong>Download project</strong> and continue locally.
						</p>
					</div>
					<div
						style={{display: 'flex', justifyContent: 'flex-end', marginTop: 20}}
					>
						<button
							ref={noticeButtonRef}
							className="experimental-notice-control"
							onClick={() => {
								try {
									window.localStorage.setItem(
										experimentalNoticeStorageKey,
										'true',
									);
								} catch {
									// Still allow experimenting when browser storage is unavailable.
								}

								setNoticeAcknowledged(true);
							}}
							style={{
								appearance: 'none',
								backgroundColor: '#0b84f3',
								border: 0,
								borderRadius: 6,
								color: 'white',
								fontSize: 14,
								margin: 0,
								minWidth: 64,
								padding: 10,
							}}
							type="button"
						>
							OK
						</button>
					</div>
				</dialog>
			</div>
		);
	}

	if (projectState.type !== 'ready') {
		let progress: number | null = null;
		if (
			projectState.type === 'loading' &&
			projectState.progress.phase === 'downloading-files'
		) {
			progress =
				projectState.progress.totalBytes === 0
					? projectState.progress.totalFiles === 0
						? 0
						: Math.min(
								1,
								projectState.progress.loadedFiles /
									projectState.progress.totalFiles,
							)
					: Math.min(
							1,
							projectState.progress.loadedBytes /
								projectState.progress.totalBytes,
						);
		}

		return (
			<div style={loadingBackdrop}>
				<div aria-modal="true" role="dialog" style={loadingDialog}>
					<div style={{fontSize: 18, fontWeight: 600}}>
						{projectState.type === 'loading'
							? 'Loading GitHub project'
							: 'Could not load GitHub project'}
					</div>
					<div
						style={{
							color: '#aaaaaa',
							fontSize: 13,
							marginTop: 8,
							overflowWrap: 'anywhere',
						}}
					>
						{projectState.repoUrl}
					</div>
					{projectState.type === 'loading' ? (
						<>
							<progress
								aria-label="Loading repository"
								max={1}
								style={progressBar}
								value={progress ?? undefined}
							/>
							<div style={{color: '#cccccc', fontSize: 13, marginTop: 10}}>
								{projectState.progress.phase === 'reading-repository'
									? 'Reading repository…'
									: projectState.progress.phase === 'preparing-project'
										? 'Preparing project…'
										: `Downloading files… ${Math.round((progress ?? 0) * 100)}%`}
							</div>
						</>
					) : (
						<>
							<div style={{color: '#ff8080', fontSize: 14, marginTop: 20}}>
								{projectState.message}
							</div>
							<button
								onClick={() =>
									setProjectState({
										project: createBlankTemplateProject(),
										type: 'ready',
									})
								}
								style={{
									backgroundColor: '#0b84f3',
									border: 0,
									borderRadius: 4,
									cursor: 'pointer',
									fontSize: 14,
									marginTop: 20,
									padding: '8px 12px',
								}}
								type="button"
							>
								Start with a blank project
							</button>
						</>
					)}
				</div>
			</div>
		);
	}

	return (
		<BrowserStudio
			initialElement={
				initialElementState.type === 'payload'
					? initialElementState.payload
					: null
			}
			project={projectState.project}
			readOnly={false}
			remotionPackageSource={{
				baseUrl: new URL(
					`/__remotion_browser_studio_workspace__/commits/${__BROWSER_STUDIO_WORKSPACE_COMMIT__}/`,
					window.location.href,
				).href,
				commit: __BROWSER_STUDIO_WORKSPACE_COMMIT__,
				type: 'workspace',
			}}
		/>
	);
};

const root = document.getElementById('root');
if (!root) {
	throw new Error('Could not find root element');
}

createRoot(root).render(
	<div style={page}>
		<BrowserStudioContent />
	</div>,
);
