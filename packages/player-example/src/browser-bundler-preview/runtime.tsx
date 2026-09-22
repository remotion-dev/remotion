import {
	createBrowserBundleRuntime,
	createBrowserCompositionObserver,
	type BrowserComposition,
} from '@remotion/browser-bundler/runtime';
import {
	Canvas,
	getCanvasSelectionItemKey,
	useCanvasController,
	useCanvasSelection,
	type CanvasSelectionItem,
	type SequenceNodePathInfo,
	type TimelineTrackData,
} from '@remotion/canvas';
import React, {useEffect, useMemo, useSyncExternalStore} from 'react';
import {createRoot} from 'react-dom/client';
import type {
	BrowserBundlerPreviewNode,
	CreateBrowserBundlerPreview,
} from './bridge';

const fallbackAbsolutePath = 'browser-bundler-example';

const getExampleNodePathInfo = (
	layer: TimelineTrackData,
	sourceNode: BrowserBundlerPreviewNode | undefined,
): SequenceNodePathInfo => {
	return (
		layer.nodePathInfo ?? {
			sequenceSubscriptionKey: {
				absolutePath: sourceNode?.filePath ?? fallbackAbsolutePath,
				effectKeys: [],
				nodePath: sourceNode?.nodePath ?? ['sequence', layer.sequence.id],
				sequenceKeys: [],
				videoConfigValues: null,
			},
			auxiliaryKeys: [],
			index: 0,
			numberOfSequencesWithThisNodePath: 1,
			supportsEffects: layer.sequence.controls?.supportsEffects === true,
		}
	);
};

const Preview: React.FC<{
	readonly composition: BrowserComposition;
	readonly revision: number;
	readonly sourceNodes: BrowserBundlerPreviewNode[];
	readonly onDeleteJsxNodes: (
		nodes: BrowserBundlerPreviewNode[],
	) => Promise<void>;
	readonly onReady: (revision: number) => void;
}> = ({
	composition: preview,
	revision,
	sourceNodes,
	onDeleteJsxNodes,
	onReady,
}) => {
	const controller = useCanvasController();
	const layers = useSyncExternalStore(
		controller.timeline.subscribe,
		controller.timeline.getSnapshot,
		controller.timeline.getSnapshot,
	);
	const selection = useCanvasSelection(controller.selection);
	const selectedKeys = useMemo(
		() => new Set(selection.selectedItems.map(getCanvasSelectionItemKey)),
		[selection.selectedItems],
	);
	const selectableLayers: CanvasSelectionItem[] = layers.map(
		(layer, index) => ({
			type: 'sequence',
			nodePathInfo: getExampleNodePathInfo(layer, sourceNodes[index]),
		}),
	);
	const selectedNodes = useMemo(() => {
		const nodes = new Map<string, BrowserBundlerPreviewNode>();
		for (let index = 0; index < layers.length; index++) {
			const layer = layers[index];
			const layerSelection: CanvasSelectionItem = {
				type: 'sequence',
				nodePathInfo: getExampleNodePathInfo(layer, sourceNodes[index]),
			};
			if (!selectedKeys.has(getCanvasSelectionItemKey(layerSelection))) {
				continue;
			}

			const node = sourceNodes[index];
			if (!node) {
				continue;
			}

			nodes.set(JSON.stringify(node), node);
		}

		return Array.from(nodes.values());
	}, [layers, selectedKeys, sourceNodes]);

	useEffect(() => onReady(revision), [onReady, preview, revision]);
	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (
				(event.key !== 'Backspace' && event.key !== 'Delete') ||
				event.repeat ||
				event.altKey ||
				event.ctrlKey ||
				event.metaKey ||
				selectedNodes.length === 0
			) {
				return;
			}

			const target = event.target;
			if (
				target instanceof HTMLElement &&
				(target.isContentEditable ||
					target.tagName === 'INPUT' ||
					target.tagName === 'SELECT' ||
					target.tagName === 'TEXTAREA')
			) {
				return;
			}

			event.preventDefault();
			controller.selection.clear();
			void onDeleteJsxNodes(selectedNodes);
		};

		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [controller.selection, onDeleteJsxNodes, selectedNodes]);

	return (
		<section
			aria-label="Compiled composition"
			style={{
				backgroundColor: '#0b0d12',
				color: '#e5e7eb',
				display: 'grid',
				gridTemplateRows: '40px minmax(0, 1fr) 250px',
				height: '100vh',
				overflow: 'hidden',
			}}
		>
			<p
				style={{
					alignItems: 'center',
					backgroundColor: '#141820',
					borderBottom: '1px solid #2b303b',
					color: '#9ca3af',
					display: 'flex',
					fontSize: 12,
					margin: 0,
					padding: '0 14px',
				}}
			>
				{preview.width} x {preview.height} / {preview.fps} fps /{' '}
				{preview.durationInFrames} frames
			</p>
			<div
				style={{
					alignItems: 'center',
					backgroundColor: '#080a0f',
					display: 'flex',
					justifyContent: 'center',
					minHeight: 0,
					overflow: 'hidden',
					padding: 20,
				}}
			>
				<Canvas
					controller={controller}
					component={preview.component}
					inputProps={preview.props}
					compositionWidth={preview.width}
					compositionHeight={preview.height}
					fps={preview.fps}
					durationInFrames={preview.durationInFrames}
					controls
					alwaysShowControls
					showPlaybackRateControl
					spaceKeyToPlayOrPause={false}
					loop
					acknowledgeRemotionLicense
					errorFallback={({error}) => (
						<p role="alert">Could not play the composition: {error.message}</p>
					)}
					style={{maxHeight: '100%', maxWidth: '100%', width: '100%'}}
				/>
			</div>
			<section
				aria-label="Mounted layers"
				style={{
					backgroundColor: '#12161e',
					borderTop: '1px solid #2b303b',
					display: 'flex',
					flexDirection: 'column',
					minHeight: 0,
				}}
			>
				<header
					style={{
						alignItems: 'center',
						borderBottom: '1px solid #2b303b',
						display: 'flex',
						flex: '0 0 42px',
						padding: '0 14px',
					}}
				>
					<h2 style={{fontSize: 13, margin: 0}}>Layers ({layers.length})</h2>
					<section
						aria-label="Layer selection"
						style={{
							alignItems: 'center',
							display: 'flex',
							gap: 8,
							marginLeft: 'auto',
						}}
					>
						<h2
							style={{
								color: '#9ca3af',
								fontSize: 12,
								fontWeight: 400,
								margin: 0,
							}}
						>
							{selectedNodes.length === 0
								? 'Select a layer, then press Backspace to delete it'
								: `${selectedNodes.length} selected · Backspace to delete`}
						</h2>
						<button
							type="button"
							onClick={controller.selection.clear}
							style={{
								backgroundColor: '#1f2937',
								border: '1px solid #374151',
								borderRadius: 4,
								color: '#d1d5db',
								fontSize: 11,
								padding: '3px 8px',
							}}
						>
							Clear
						</button>
					</section>
				</header>
				{layers.length === 0 ? (
					<p style={{color: '#9ca3af', fontSize: 12, padding: '0 14px'}}>
						No layers mounted.
					</p>
				) : (
					<ol
						style={{
							listStyle: 'none',
							margin: 0,
							overflow: 'auto',
							padding: 0,
						}}
					>
						{layers.map((layer, index) => {
							const nodePathInfo = getExampleNodePathInfo(
								layer,
								sourceNodes[index],
							);
							const layerSelection: CanvasSelectionItem = {
								type: 'sequence',
								nodePathInfo,
							};
							const layerSelected = selectedKeys.has(
								getCanvasSelectionItemKey(layerSelection),
							);

							return (
								<li
									key={layer.sequence.id}
									style={{borderBottom: '1px solid #242a34'}}
								>
									<button
										type="button"
										aria-pressed={layerSelected}
										onClick={(event) => {
											controller.selection.select(
												layerSelection,
												{
													shiftKey: event.shiftKey,
													toggleKey: event.metaKey || event.ctrlKey,
												},
												selectableLayers,
											);
										}}
										style={{
											alignItems: 'center',
											backgroundColor: layerSelected
												? '#242c48'
												: 'transparent',
											border: 0,
											color: '#e5e7eb',
											display: 'grid',
											fontSize: 11,
											gridTemplateColumns: 'minmax(100px, 26%) minmax(0, 1fr)',
											padding: '4px 14px',
											textAlign: 'left',
											width: '100%',
										}}
									>
										<strong style={{paddingLeft: layer.depth * 12}}>
											{layer.sequence.displayName ?? layer.sequence.type}
										</strong>
										<div
											style={{
												backgroundColor: '#0b0f16',
												borderRadius: 3,
												height: 22,
												overflow: 'hidden',
												position: 'relative',
											}}
										>
											<div
												style={{
													alignItems: 'center',
													backgroundColor: layerSelected
														? '#6366f1'
														: '#374151',
													borderRadius: 3,
													boxSizing: 'border-box',
													display: 'flex',
													height: '100%',
													left: `${(Math.max(0, layer.sequence.from) / preview.durationInFrames) * 100}%`,
													padding: '0 7px',
													position: 'absolute',
													whiteSpace: 'nowrap',
													width: `${(Math.min(layer.sequence.duration, preview.durationInFrames) / preview.durationInFrames) * 100}%`,
												}}
											>
												frame {layer.sequence.from} · {layer.sequence.duration}f
											</div>
										</div>
									</button>
								</li>
							);
						})}
					</ol>
				)}
			</section>
		</section>
	);
};

export const createBrowserBundlerPreview: CreateBrowserBundlerPreview = ({
	onDeleteJsxNodes,
	onError,
}) => {
	const container = document.getElementById('browser-bundler-preview');
	if (!container) {
		throw new Error('The Canvas preview container was not found.');
	}

	const runtime = createBrowserBundleRuntime();
	let disposed = false;
	let revision = 0;
	let sourceNodes: BrowserBundlerPreviewNode[] = [];
	let pending: {
		revision: number;
		resolve: () => void;
		reject: (error: Error) => void;
		timeout: number;
	} | null = null;

	const reportError = (error: unknown) => {
		if (disposed) {
			return;
		}

		const message = error instanceof Error ? error.message : String(error);
		if (pending) {
			window.clearTimeout(pending.timeout);
			pending.reject(new Error(message));
			pending = null;
		}

		onError(message);
	};
	const onReady = (readyRevision: number) => {
		if (pending?.revision !== readyRevision) {
			return;
		}

		window.clearTimeout(pending.timeout);
		pending.resolve();
		pending = null;
	};
	const root = createRoot(container, {
		onCaughtError: reportError,
		onUncaughtError: reportError,
	});
	const observer = createBrowserCompositionObserver({
		onChange: (composition) => {
			root.render(
				<Preview
					composition={composition}
					revision={revision}
					sourceNodes={sourceNodes}
					onDeleteJsxNodes={onDeleteJsxNodes}
					onReady={onReady}
				/>,
			);
		},
		onError: reportError,
	});

	const dispose = () => {
		if (disposed) {
			return;
		}

		disposed = true;
		window.removeEventListener('pagehide', dispose);
		if (pending) {
			window.clearTimeout(pending.timeout);
			pending.reject(new Error('The Canvas preview was disposed.'));
			pending = null;
		}

		try {
			root.unmount();
		} finally {
			try {
				observer.dispose();
			} finally {
				runtime.dispose();
			}
		}
	};
	window.addEventListener('pagehide', dispose);

	return {
		applyBundle: async (bundle, nextSourceNodes) => {
			if (disposed) {
				throw new Error('The Canvas preview was disposed.');
			}

			sourceNodes = nextSourceNodes;
			const RegisteredRoot = await runtime.applyBundle(bundle);
			if (disposed) {
				throw new Error('The Canvas preview was disposed.');
			}

			revision++;
			await new Promise<void>((resolve, reject) => {
				pending = {
					revision,
					resolve,
					reject,
					timeout: window.setTimeout(
						() =>
							reportError(
								new Error('Timed out while resolving the preview composition.'),
							),
						30_000,
					),
				};
				observer.update({
					root: RegisteredRoot,
					compositionId: 'BrowserDemo',
					inputProps: {},
				});
			});
		},
		dispose,
	};
};
