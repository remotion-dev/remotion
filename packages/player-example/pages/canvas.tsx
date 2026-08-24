import {
	Canvas,
	getCanvasSelectionItemKey,
	useCanvasController,
	useCanvasSelection,
	type CanvasSelectionItem,
	type SequenceNodePathInfo,
	type TimelineTrackData,
} from '@remotion/canvas';
import React, {useSyncExternalStore} from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';

const CanvasComposition: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill
			style={{
				alignItems: 'center',
				backgroundColor: '#111827',
				color: 'white',
				fontFamily: 'sans-serif',
				justifyContent: 'center',
			}}
		>
			<Sequence name="Background" layout="none">
				<AbsoluteFill
					style={{
						background:
							'linear-gradient(135deg, #111827 0%, #312e81 50%, #7c3aed 100%)',
					}}
				/>
			</Sequence>
			{frame < 90 ? (
				<Sequence name="Intro card" durationInFrames={90}>
					<h1 style={{fontSize: 88}}>Canvas</h1>
				</Sequence>
			) : null}
			{frame >= 60 ? (
				<Sequence name="Details" from={60} durationInFrames={120}>
					<div style={{fontSize: 54}}>Live timeline layers</div>
				</Sequence>
			) : null}
		</AbsoluteFill>
	);
};

const getExampleNodePathInfo = (
	layer: TimelineTrackData,
): SequenceNodePathInfo => {
	return (
		layer.nodePathInfo ?? {
			sequenceSubscriptionKey: {
				absolutePath: 'canvas-example',
				effectKeys: [],
				nodePath: ['sequence', layer.sequence.id],
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

const CanvasPage: React.FC = () => {
	const controller = useCanvasController();
	const layers = useSyncExternalStore(
		controller.timeline.subscribe,
		controller.timeline.getSnapshot,
		controller.timeline.getSnapshot,
	);
	const selection = useCanvasSelection(controller.selection);
	const selectedKeys = new Set(
		selection.selectedItems.map(getCanvasSelectionItemKey),
	);
	const selectableLayers: CanvasSelectionItem[] = layers.map((layer) => ({
		type: 'sequence',
		nodePathInfo: getExampleNodePathInfo(layer),
	}));

	return (
		<main
			style={{
				fontFamily: 'sans-serif',
				margin: '40px auto',
				maxWidth: 1100,
				padding: '0 20px',
			}}
		>
			<h1>Canvas layers</h1>
			<p>
				This page renders <code>@remotion/canvas</code> and subscribes to the
				layers currently mounted in its Player.
			</p>
			<div
				style={{
					alignItems: 'start',
					display: 'grid',
					gap: 32,
					gridTemplateColumns: 'minmax(0, 2fr) minmax(240px, 1fr)',
				}}
			>
				<Canvas
					controller={controller}
					component={CanvasComposition}
					compositionWidth={1280}
					compositionHeight={720}
					durationInFrames={180}
					fps={30}
					controls
					acknowledgeRemotionLicense
					style={{width: '100%'}}
				/>
				<div>
					<section
						style={{
							border: '1px solid #d1d5db',
							borderRadius: 8,
							padding: 20,
						}}
					>
						<h2 style={{marginTop: 0}}>Mounted layers ({layers.length})</h2>
						{layers.length === 0 ? (
							<p>No layers mounted.</p>
						) : (
							<ol style={{paddingLeft: 24}}>
								{layers.map((layer) => {
									const nodePathInfo = getExampleNodePathInfo(layer);
									const layerSelection: CanvasSelectionItem = {
										type: 'sequence',
										nodePathInfo,
									};
									const opacitySelection: CanvasSelectionItem = {
										type: 'sequence-prop',
										nodePathInfo,
										key: 'style.opacity',
									};
									const easingSelection: CanvasSelectionItem = {
										type: 'easing',
										nodePathInfo: {
											...nodePathInfo,
											auxiliaryKeys: ['controls', 'style.opacity'],
										},
										fromFrame: layer.sequence.from,
										toFrame: Math.min(
											layer.sequence.from + 30,
											layer.sequence.from + layer.sequence.duration,
										),
										segmentIndex: 0,
									};
									const layerSelected = selectedKeys.has(
										getCanvasSelectionItemKey(layerSelection),
									);
									const opacitySelected = selectedKeys.has(
										getCanvasSelectionItemKey(opacitySelection),
									);
									const easingSelected = selectedKeys.has(
										getCanvasSelectionItemKey(easingSelection),
									);

									return (
										<li
											key={layer.sequence.id}
											style={{
												marginBottom: 16,
												paddingLeft: layer.depth * 16,
											}}
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
													backgroundColor: layerSelected ? '#ddd6fe' : 'white',
													border: '1px solid #d1d5db',
													borderRadius: 4,
													padding: '6px 8px',
													textAlign: 'left',
													width: '100%',
												}}
											>
												<strong>
													{layer.sequence.displayName ?? layer.sequence.type}
												</strong>
												<div style={{color: '#555', fontSize: 14}}>
													{layer.sequence.type} · frame {layer.sequence.from} ·{' '}
													{layer.sequence.duration} frames
												</div>
											</button>
											<div style={{display: 'flex', gap: 6, marginTop: 6}}>
												<button
													type="button"
													aria-pressed={opacitySelected}
													onClick={() =>
														controller.selection.select(
															opacitySelection,
															{shiftKey: false, toggleKey: true},
															[opacitySelection],
														)
													}
												>
													style.opacity
												</button>
												<button
													type="button"
													aria-pressed={easingSelected}
													onClick={() =>
														controller.selection.select(
															easingSelection,
															{shiftKey: false, toggleKey: true},
															[easingSelection],
														)
													}
												>
													Opacity easing
												</button>
											</div>
										</li>
									);
								})}
							</ol>
						)}
					</section>
					<section
						style={{
							border: '1px solid #d1d5db',
							borderRadius: 8,
							marginTop: 16,
							padding: 20,
						}}
					>
						<h2 style={{marginTop: 0}}>
							Selection ({selection.selectedItems.length})
						</h2>
						<p style={{fontSize: 14}}>
							Click a layer to replace the selection. Shift-click selects a
							contiguous range; Command/Ctrl-click toggles a layer. Property and
							easing buttons demonstrate different selection item types.
						</p>
						<button type="button" onClick={controller.selection.clear}>
							Clear selection
						</button>
						<pre
							style={{
								backgroundColor: '#f3f4f6',
								fontSize: 12,
								overflowX: 'auto',
								padding: 12,
								whiteSpace: 'pre-wrap',
							}}
						>
							{JSON.stringify(selection, null, 2)}
						</pre>
					</section>
				</div>
			</div>
		</main>
	);
};

export default CanvasPage;
