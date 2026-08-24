import {Canvas, useCanvasController} from '@remotion/canvas';
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
							{layers.map((layer) => (
								<li
									key={layer.sequence.id}
									style={{marginBottom: 12, paddingLeft: layer.depth * 16}}
								>
									<strong>
										{layer.sequence.displayName ?? layer.sequence.type}
									</strong>
									<div style={{color: '#555', fontSize: 14}}>
										{layer.sequence.type} · frame {layer.sequence.from} ·{' '}
										{layer.sequence.duration} frames
									</div>
								</li>
							))}
						</ol>
					)}
				</section>
			</div>
		</main>
	);
};

export default CanvasPage;
