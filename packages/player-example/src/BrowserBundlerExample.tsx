import {
	BrowserBundlerError,
	createBrowserBundler,
	type VirtualProject,
} from '@remotion/browser-bundler';
import Link from 'next/link';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import type {BrowserBundlerPreview} from './browser-bundler-preview/bridge';

const initialSource = `import React, {useState} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
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
      <Orb accent={accent} />
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
				message: 'The Player preview iframe is missing.',
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
					failPreview(new Error('Timed out while loading the Player preview.')),
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
							'The Player preview reloaded. Reload this page to reconnect.',
						),
					);
					return;
				}

				loaded = true;
				const initialize = iframe.contentWindow?.remotionBrowserBundlerPreview;
				if (!initialize) {
					failPreview(
						new Error(
							'Could not load the development Player preview. Run "bun run make" in packages/player-example and reload this page.',
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
				failPreview(new Error('The Player preview iframe failed to load.'));
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
				rejectPreview(new Error('The Player preview was disposed.'));
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
				fontFamily: 'sans-serif',
				margin: '40px auto',
				maxWidth: 1000,
				padding: '0 20px',
			}}
		>
			<Link href="/">All Player examples</Link>
			<h1>Browser-compiled Player</h1>
			<p>
				A virtual Remotion project calls <code>registerRoot()</code>. This page
				selects <code>BrowserDemo</code> and uses its registered component,
				default props, and calculated metadata in a Player.
			</p>
			<p>
				Edits use React Fast Refresh to preserve component state and playback.
				The persistent preview iframe bundles its own development React, even
				when this page uses production React. Only run code you trust: this
				same-origin iframe is not a security sandbox.
			</p>
			<div>
				<label htmlFor="browser-video-source">
					<strong>Video.tsx source</strong>
				</label>
				<textarea
					id="browser-video-source"
					value={source}
					onChange={(event) => {
						const nextSource = event.target.value;
						setSource(nextSource);
						void compile(nextSource);
					}}
					rows={17}
					spellCheck={false}
					style={{
						boxSizing: 'border-box',
						display: 'block',
						fontFamily: 'monospace',
						fontSize: 13,
						lineHeight: 1.5,
						margin: '8px 0 12px',
						padding: 12,
						width: '100%',
					}}
				/>
			</div>
			<p role="status" aria-live="polite">
				{state.type === 'loading'
					? (progress ?? 'Compiling the virtual project...')
					: state.type === 'ready'
						? 'BrowserDemo compiled successfully with Fast Refresh.'
						: 'Compilation or preview failed.'}
			</p>
			{warnings.length > 0 ? (
				<section aria-label="Compiler warnings">
					<h2>Warnings</h2>
					<ul>
						{warnings.map((warning, index) => (
							<li key={`${index}-${warning}`}>
								<pre style={{whiteSpace: 'pre-wrap'}}>{warning}</pre>
							</li>
						))}
					</ul>
				</section>
			) : null}
			{state.type === 'error' ? (
				<pre role="alert" style={{color: '#b91c1c', whiteSpace: 'pre-wrap'}}>
					{state.message}
				</pre>
			) : null}
			{/* eslint-disable-next-line @remotion/warn-native-media-tag */}
			<iframe
				ref={iframeRef}
				title="Live Player preview"
				allow="autoplay; fullscreen"
				style={{border: 0, width: '100%', aspectRatio: '1280 / 840'}}
			/>
		</main>
	);
};
