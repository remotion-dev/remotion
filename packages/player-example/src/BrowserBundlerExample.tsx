import {
	BrowserBundlerError,
	createBrowserBundler,
	type VirtualProject,
} from '@remotion/browser-bundler';
import {
	getBrowserComposition,
	loadBrowserBundle,
	type BrowserComposition,
} from '@remotion/browser-bundler/runtime';
import {Player} from '@remotion/player';
import Link from 'next/link';
import React, {useCallback, useEffect, useRef, useState} from 'react';

const initialSource = `import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Orb} from './Orb';

export const Video: React.FC<{title: string; accent: string}> = ({title, accent}) => {
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
      </div>
    </AbsoluteFill>
  );
};
`;

const project: VirtualProject = {
	rootDir: '/browser-demo',
	entryPoint: '/browser-demo/src/index.ts',
	files: {
		'/browser-demo/src/index.ts': `import {registerRoot} from 'remotion';
import {Root} from './Root';
registerRoot(Root);
`,
		'/browser-demo/src/Root.tsx': `import React from 'react';
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
		'/browser-demo/src/Video.tsx': initialSource,
		'/browser-demo/src/Orb.tsx': `import React from 'react';
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
	| {
			type: 'ready';
			composition: BrowserComposition;
			revision: number;
	  };

export const BrowserBundlerExample: React.FC = () => {
	const [source, setSource] = useState(initialSource);
	const [state, setState] = useState<CompilationState>({type: 'loading'});
	const [progress, setProgress] = useState<string | null>(null);
	const [warnings, setWarnings] = useState<string[]>([]);
	const bundlerRef = useRef<ReturnType<typeof createBrowserBundler> | null>(
		null,
	);
	const requestId = useRef(0);
	const abortRef = useRef<AbortController | null>(null);

	const compile = useCallback(async (videoSource: string) => {
		const bundler = bundlerRef.current;
		if (!bundler) {
			return;
		}

		const revision = ++requestId.current;
		abortRef.current?.abort();
		const controller = new AbortController();
		abortRef.current = controller;
		setState({type: 'loading'});
		setWarnings([]);
		setProgress(null);

		try {
			const bundle = await bundler.bundle({
				project: {
					...project,
					files: {
						...project.files,
						'/browser-demo/src/Video.tsx': videoSource,
					},
				},
			});
			if (controller.signal.aborted || revision !== requestId.current) {
				return;
			}

			setWarnings(bundle.warnings);
			const root = loadBrowserBundle({bundle});
			const composition = await getBrowserComposition({
				root,
				compositionId: 'BrowserDemo',
				inputProps: {},
				signal: controller.signal,
			});
			if (controller.signal.aborted || revision !== requestId.current) {
				return;
			}

			setState({type: 'ready', composition, revision});
		} catch (error) {
			if (controller.signal.aborted || revision !== requestId.current) {
				return;
			}

			setState({
				type: 'error',
				message: getCompilationErrorMessage(error),
			});
		}
	}, []);

	useEffect(() => {
		let disposed = false;
		try {
			const bundler = createBrowserBundler({
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
			bundlerRef.current = bundler;
			void compile(initialSource);

			return () => {
				disposed = true;
				abortRef.current?.abort();
				bundlerRef.current = null;
				bundler.dispose();
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
			<Link
				href="/"
				onNavigate={(event) => {
					// Leave the isolated document when returning to other examples.
					event.preventDefault();
					window.location.assign('/');
				}}
			>
				All Player examples
			</Link>
			<h1>Browser-compiled Player</h1>
			<p>
				A virtual Remotion project calls <code>registerRoot()</code>. This page
				selects <code>BrowserDemo</code> and uses its registered component,
				default props, and calculated metadata in a Player.
			</p>
			<p>
				Edit the source and compile again. Only run code you trust: the compiled
				code runs in this page, not in a sandbox.
			</p>
			<form
				onSubmit={(event) => {
					event.preventDefault();
					void compile(source);
				}}
			>
				<label htmlFor="browser-video-source">
					<strong>Video.tsx source</strong>
				</label>
				<textarea
					id="browser-video-source"
					value={source}
					onChange={(event) => setSource(event.target.value)}
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
				<button type="submit">Compile</button>
			</form>
			<p role="status" aria-live="polite">
				{state.type === 'loading'
					? (progress ?? 'Compiling the virtual project...')
					: state.type === 'ready'
						? 'BrowserDemo compiled successfully.'
						: 'Compilation failed.'}
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
			{state.type === 'ready' ? (
				<section aria-label="Compiled composition">
					<p>
						{state.composition.width} x {state.composition.height} /{' '}
						{state.composition.fps} fps / {state.composition.durationInFrames}{' '}
						frames
					</p>
					<Player
						key={state.revision}
						component={state.composition.component}
						inputProps={state.composition.props}
						compositionWidth={state.composition.width}
						compositionHeight={state.composition.height}
						fps={state.composition.fps}
						durationInFrames={state.composition.durationInFrames}
						controls
						loop
						acknowledgeRemotionLicense
						errorFallback={({error}) => (
							<div role="alert">
								Could not play the composition: {error.message}
							</div>
						)}
						style={{width: '100%'}}
					/>
				</section>
			) : null}
		</main>
	);
};
