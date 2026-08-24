import {
	Canvas,
	getCanvasSelectionItemKey,
	useCanvasController,
	useCanvasSelection,
	type CanvasSelectionItem,
	type CanvasSelectionMode,
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

const CanvasPage: React.FC = () => {
	const controller = useCanvasController();
	const layers = useSyncExternalStore(
		controller.timeline.subscribe,
		controller.timeline.getSnapshot,
		controller.timeline.getSnapshot,
	);
	const selection = useCanvasSelection(controller);
	const selectedKeys = new Set(
		selection.selectedItems.map(getCanvasSelectionItemKey),
	);

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
									const entity = {
										type: 'sequence' as const,
										id: layer.sequence.id,
									};
									const layerSelection: CanvasSelectionItem = {
										type: 'entity',
										entity,
									};
									const opacitySelection: CanvasSelectionItem = {
										type: 'property',
										entity,
										propertyPath: ['style', 'opacity'],
									};
									const easingSelection: CanvasSelectionItem = {
										type: 'easing',
										entity,
										propertyPath: ['style', 'opacity'],
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
													const mode: CanvasSelectionMode =
														event.metaKey || event.ctrlKey
															? 'toggle'
															: event.shiftKey
																? 'add'
																: 'replace';
													controller.selection.select(layerSelection, mode);
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
															'toggle',
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
															'toggle',
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
							Click a layer to replace the selection. Shift-click adds a layer;
							Command/Ctrl-click toggles it. Property and easing buttons toggle
							heterogeneous items.
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
