import {
	BrowserBundlerError,
	createBrowserBundler,
	type VirtualProject,
} from '@remotion/browser-bundler';
import {addSolid} from '@remotion/studio-codemods';
import Link from 'next/link';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import type {BrowserBundlerPreview} from './browser-bundler-preview/bridge';

const initialSource = `import React, {useState} from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig} from 'remotion';
import {Orb} from './Orb';

export const Video: React.FC<{title: string; accent: string}> = ({title, accent}) => {
  const [clicks, setClicks] = useState(0);
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();

  return (
    <AbsoluteFill style={{
      backgroundColor: '#0f172a', color: 'white', fontFamily: 'sans-serif',
      justifyContent: 'center', padding: 80,
    }}>
      <Sequence name="Background" layout="none">
        <AbsoluteFill style={{background: 'linear-gradient(135deg, #0f172a, #312e81)'}} />
      </Sequence>
      <Sequence name="Orb" layout="none">
        <Orb accent={accent} />
      </Sequence>
      <Sequence name="Content" layout="none">
        <div style={{position: 'relative', transform: \`translateY(\${Math.sin(frame / fps) * 12}px)\`}}>
          <h1 style={{fontSize: 76, margin: 0}}>{title}</h1>
          <p style={{fontSize: 28, color: accent}}>Frame {frame} of {durationInFrames}</p>
          <button type="button" style={{fontSize: 28, padding: '8px 16px'}}
            onClick={(event) => {
              event.stopPropagation();
              setClicks((value) => value + 1);
            }}>
            Clicks: {clicks}
          </button>
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};
`;

const project: VirtualProject = {
	entryPoint: 'src/index.ts',
	files: {
		'src/index.ts': `import {registerRoot} from 'remotion';
import {Root} from './Root';
registerRoot(Root);
`,
		'src/Root.tsx': `import React from 'react';
import {Composition, Folder} from 'remotion';
import {Video} from './Video';

export const Root = () => (
  <Folder name="Browser">
    <Composition
      id="BrowserDemo"
      component={Video}
      width={1280}
      height={720}
      fps={30}
      durationInFrames={150}
      defaultProps={{title: 'Compiled in the browser', accent: '#60a5fa'}}
      calculateMetadata={({props}) => ({
        durationInFrames: Math.max(90, props.title.length * 6),
        props: {...props, title: props.title.trim()},
      })}
    />
  </Folder>
);
`,
		'src/Video.tsx': initialSource,
		'src/Orb.tsx': `import React from 'react';
import {useCurrentFrame} from 'remotion';

export const Orb: React.FC<{accent: string}> = ({accent}) => {
  const frame = useCurrentFrame();
  return <div style={{
    position: 'absolute', width: 450, height: 450, borderRadius: '50%',
    right: -80, top: -80, backgroundColor: accent, opacity: 0.3,
    transform: \`translateY(\${Math.sin(frame / 25) * 100}px)\`,
  }} />;
};
`,
	},
};

const getCompilationErrorMessage = (error: unknown): string => {
	if (error instanceof BrowserBundlerError) {
		return [error.message, ...error.diagnostics].join('\n\n');
	}

	return error instanceof Error ? error.message : String(error);
};

type CompilationState =
	| {type: 'loading'}
	| {type: 'error'; message: string}
	| {type: 'ready'};

type CompilationSession = {
	bundler: ReturnType<typeof createBrowserBundler>;
	preview: Promise<BrowserBundlerPreview>;
	queue: Promise<void>;
	revision: number;
	disposed: boolean;
};

export const BrowserBundlerExample: React.FC = () => {
	const [source, setSource] = useState(initialSource);
	const [state, setState] = useState<CompilationState>({type: 'loading'});
	const [progress, setProgress] = useState<string | null>(null);
	const [warnings, setWarnings] = useState<string[]>([]);
	const iframeRef = useRef<HTMLIFrameElement | null>(null);
	const sessionRef = useRef<CompilationSession | null>(null);

	const compile = useCallback(async (videoSource: string) => {
		const session = sessionRef.current;
		if (!session || session.disposed) {
			return;
		}

		const revision = ++session.revision;
		setState({type: 'loading'});
		setWarnings([]);
		setProgress(null);

		session.queue = session.queue.then(async () => {
			if (session.disposed || revision !== session.revision) {
				return;
			}

			try {
				const preview = await session.preview;
				if (session.disposed || revision !== session.revision) {
					return;
				}

				const bundle = await session.bundler.bundle({
					project: {
						...project,
						files: {
							...project.files,
							'src/Video.tsx': videoSource,
						},
					},
				});
				if (session.disposed) {
					return;
				}

				// Coalesce edits before compilation, but never discard a compiled
				// update: the next HMR update builds on this bundle's module graph.
				await preview.applyBundle(bundle);
				if (session.disposed || revision !== session.revision) {
					return;
				}

				setWarnings(bundle.warnings);
				setState({type: 'ready'});
			} catch (error) {
				if (session.disposed || revision !== session.revision) {
					return;
				}

				setState({
					type: 'error',
					message: getCompilationErrorMessage(error),
				});
			}
		});
		await session.queue;
	}, []);

	useEffect(() => {
		const iframe = iframeRef.current;
		if (!iframe) {
			setState({
				type: 'error',
				message: 'The Canvas preview iframe is missing.',
			});
			return;
		}

		let disposed = false;
		try {
			const bundler = createBrowserBundler({
				enableFastRefresh: true,
				onProgress: ({loadedBytes, totalBytes}) => {
					if (disposed) {
						return;
					}

					setProgress(
						totalBytes
							? `Loading compiler: ${Math.round((loadedBytes / totalBytes) * 100)}%`
							: `Loading compiler: ${(loadedBytes / 1024 / 1024).toFixed(1)} MB`,
					);
				},
			});
			let resolvePreview: (preview: BrowserBundlerPreview) => void;
			let rejectPreview: (error: unknown) => void;
			const preview = new Promise<BrowserBundlerPreview>((resolve, reject) => {
				resolvePreview = resolve;
				rejectPreview = reject;
			});
			const session: CompilationSession = {
				bundler,
				preview,
				queue: Promise.resolve(),
				revision: 0,
				disposed: false,
			};
			sessionRef.current = session;
			let previewRuntime: BrowserBundlerPreview | null = null;
			let loaded = false;
			let loadFailed = false;
			let loadTimeout: number | null = null;
			const reportPreviewError = (message: string) => {
				if (!disposed) {
					setState({type: 'error', message});
				}
			};
			const failPreview = (error: unknown) => {
				loadFailed = true;
				if (loadTimeout !== null) {
					window.clearTimeout(loadTimeout);
				}

				rejectPreview(error);
				reportPreviewError(getCompilationErrorMessage(error));
			};
			void preview.catch((error: unknown) => {
				reportPreviewError(getCompilationErrorMessage(error));
			});
			loadTimeout = window.setTimeout(
				() =>
					failPreview(new Error('Timed out while loading the Canvas preview.')),
				30_000,
			);
			const onLoad = () => {
				if (
					disposed ||
					loadFailed ||
					iframe.contentWindow?.location.href === 'about:blank'
				) {
					return;
				}

				if (loaded) {
					failPreview(
						new Error(
							'The Canvas preview reloaded. Reload this page to reconnect.',
						),
					);
					return;
				}

				loaded = true;
				const initialize = iframe.contentWindow?.remotionBrowserBundlerPreview;
				if (!initialize) {
					failPreview(
						new Error(
							'Could not load the development Canvas preview. Run "bun run make" in packages/player-example and reload this page.',
						),
					);
					return;
				}

				void initialize
					.then((createPreview) => {
						if (disposed || loadFailed) {
							return;
						}

						previewRuntime = createPreview({onError: reportPreviewError});
						if (loadTimeout !== null) {
							window.clearTimeout(loadTimeout);
						}
						resolvePreview(previewRuntime);
					})
					.catch(failPreview);
			};
			const onError = () =>
				failPreview(new Error('The Canvas preview iframe failed to load.'));
			iframe.addEventListener('load', onLoad);
			iframe.addEventListener('error', onError);
			iframe.src = '/browser-bundler-preview.html';
			void compile(initialSource);

			return () => {
				disposed = true;
				session.disposed = true;
				sessionRef.current = null;
				if (loadTimeout !== null) {
					window.clearTimeout(loadTimeout);
				}
				iframe.removeEventListener('load', onLoad);
				iframe.removeEventListener('error', onError);
				rejectPreview(new Error('The Canvas preview was disposed.'));
				try {
					previewRuntime?.dispose();
				} finally {
					bundler.dispose();
					iframe.src = 'about:blank';
				}
			};
		} catch (error) {
			setState({
				type: 'error',
				message: getCompilationErrorMessage(error),
			});
		}
	}, [compile]);

	return (
		<main
			style={{
				backgroundColor: '#0b0d12',
				color: '#e5e7eb',
				display: 'flex',
				flexDirection: 'column',
				fontFamily: 'sans-serif',
				height: '100vh',
				overflow: 'hidden',
			}}
		>
			<header
				style={{
					alignItems: 'center',
					borderBottom: '1px solid #2b303b',
					display: 'flex',
					flex: '0 0 56px',
					gap: 16,
					padding: '0 18px',
				}}
			>
				<Link href="/" style={{color: '#9ca3af', fontSize: 13}}>
					Player examples
				</Link>
				<div style={{borderLeft: '1px solid #374151', height: 24}} />
				<div>
					<h1 style={{fontSize: 16, margin: 0}}>Browser-compiled Canvas</h1>
					<div style={{color: '#9ca3af', fontSize: 12}}>
						Fast Refresh · live layers
					</div>
				</div>
				<button
					type="button"
					disabled={state.type === 'loading'}
					onClick={() => {
						try {
							const result = addSolid({
								compositionFile: 'src/Root.tsx',
								compositionId: 'BrowserDemo',
								height: 720,
								project: {
									...project,
									files: {...project.files, 'src/Video.tsx': source},
									rootDir: '/',
								},
								width: 1280,
							});
							const nextSource = result.project.files['src/Video.tsx'];
							if (!nextSource) {
								throw new Error('The codemod did not return Video.tsx.');
							}

							setSource(nextSource);
							void compile(nextSource);
						} catch (error) {
							setState({
								message: getCompilationErrorMessage(error),
								type: 'error',
							});
						}
					}}
					style={{
						backgroundColor: '#4f46e5',
						border: 0,
						borderRadius: 5,
						color: 'white',
						fontSize: 12,
						fontWeight: 600,
						marginLeft: 'auto',
						padding: '7px 11px',
					}}
				>
					Add Solid
				</button>
				<p
					role="status"
					aria-live="polite"
					style={{
						backgroundColor: state.type === 'error' ? '#3f1515' : '#172033',
						border: `1px solid ${state.type === 'error' ? '#7f1d1d' : '#293958'}`,
						borderRadius: 999,
						color: state.type === 'error' ? '#fecaca' : '#bfdbfe',
						fontSize: 12,
						margin: 0,
						padding: '5px 10px',
					}}
				>
					{state.type === 'loading'
						? (progress ?? 'Compiling…')
						: state.type === 'ready'
							? 'Up to date'
							: 'Compilation failed'}
				</p>
			</header>
			<div
				style={{
					display: 'grid',
					flex: 1,
					gridTemplateColumns: 'minmax(280px, 36%) minmax(0, 1fr)',
					minHeight: 0,
				}}
			>
				<section
					aria-label="Code editor"
					style={{
						borderRight: '1px solid #2b303b',
						display: 'flex',
						flexDirection: 'column',
						minHeight: 0,
					}}
				>
					<label
						htmlFor="browser-video-source"
						style={{
							backgroundColor: '#141820',
							borderBottom: '1px solid #2b303b',
							color: '#cbd5e1',
							fontFamily: 'monospace',
							fontSize: 12,
							padding: '10px 14px',
						}}
					>
						Video.tsx
					</label>
					<textarea
						id="browser-video-source"
						value={source}
						wrap="off"
						onChange={(event) => {
							const nextSource = event.target.value;
							setSource(nextSource);
							void compile(nextSource);
						}}
						spellCheck={false}
						style={{
							backgroundColor: '#0f131a',
							border: 0,
							boxSizing: 'border-box',
							color: '#dbeafe',
							flex: 1,
							fontFamily: 'monospace',
							fontSize: 13,
							lineHeight: 1.55,
							minHeight: 0,
							outline: 0,
							padding: 16,
							resize: 'none',
							width: '100%',
						}}
					/>
					{warnings.length > 0 || state.type === 'error' ? (
						<div
							style={{
								backgroundColor: '#171116',
								borderTop: '1px solid #4c1d24',
								maxHeight: '30%',
								overflow: 'auto',
								padding: '10px 14px',
							}}
						>
							{warnings.map((warning, index) => (
								<pre
									key={`${index}-${warning}`}
									style={{fontSize: 11, margin: 0, whiteSpace: 'pre-wrap'}}
								>
									{warning}
								</pre>
							))}
							{state.type === 'error' ? (
								<pre
									role="alert"
									style={{color: '#fca5a5', fontSize: 11, margin: 0}}
								>
									{state.message}
								</pre>
							) : null}
						</div>
					) : null}
				</section>
				<section aria-label="Preview" style={{minHeight: 0, minWidth: 0}}>
					{/* eslint-disable-next-line @remotion/warn-native-media-tag */}
					<iframe
						ref={iframeRef}
						title="Live Canvas preview"
						allow="autoplay; fullscreen"
						style={{border: 0, display: 'block', height: '100%', width: '100%'}}
					/>
				</section>
			</div>
		</main>
	);
};
