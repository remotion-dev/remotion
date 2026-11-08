import type {CSSProperties} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

const box = (
	color: string,
	zIndex: number | 'auto',
	second = false,
): CSSProperties => ({
	position: 'absolute',
	left: second ? 50 : 20,
	top: second ? 50 : 20,
	width: 100,
	height: 100,
	backgroundColor: color,
	zIndex,
});

const StackingContextSiblings: React.FC = () => {
	const frame = useCurrentFrame();
	const scenes = [
		{
			id: 'positive',
			content: (
				<>
					<div style={box('red', frame === 0 ? 2 : 0)} />
					<div style={box('blue', 1, true)} />
				</>
			),
		},
		{
			id: 'negative',
			content: (
				<>
					<div style={box('red', -1)} />
					<div style={box('blue', -2, true)} />
				</>
			),
		},
		{
			id: 'equal',
			content: (
				<>
					<div style={box('red', 1)} />
					<div style={box('blue', 1, true)} />
				</>
			),
		},
		{
			id: 'nested',
			content: (
				<>
					<div style={box('red', 2)}>
						<div
							style={{
								...box('yellow', -100),
								left: 10,
								top: 10,
								width: 70,
								height: 70,
							}}
						/>
					</div>
					<div style={box('blue', 1, true)} />
				</>
			),
		},
		{
			id: 'flex-level',
			content: (
				<div
					style={{
						display: 'flex',
						position: 'absolute',
						inset: 20,
						isolation: 'isolate',
					}}
				>
					<div
						style={{
							width: 90,
							height: 90,
							flexShrink: 0,
							background: 'red',
							zIndex: 2,
						}}
					/>
					<div
						style={{
							width: 90,
							height: 90,
							flexShrink: 0,
							marginLeft: -40,
							background: 'blue',
							zIndex: 1,
						}}
					/>
				</div>
			),
		},
		{
			id: 'grid-level',
			content: (
				<div
					style={{
						display: 'grid',
						position: 'absolute',
						inset: 20,
						isolation: 'isolate',
					}}
				>
					<div style={{gridArea: '1 / 1', background: 'red', zIndex: 2}} />
					<div
						style={{
							gridArea: '1 / 1',
							margin: 20,
							background: 'blue',
							zIndex: 1,
						}}
					/>
				</div>
			),
		},
		{
			id: 'ignored-static-level',
			content: (
				<>
					<div
						style={{
							...box('red', 10),
							position: 'static',
							width: 100,
							height: 100,
							transform: 'translate(20px,20px)',
						}}
					/>
					<div style={box('blue', 1, true)} />
				</>
			),
		},
		{
			id: 'transform-auto',
			content: (
				<>
					<div style={{...box('red', 'auto'), transform: 'translate(0px)'}} />
					<div style={box('blue', -1, true)} />
				</>
			),
		},
		{
			id: 'escaping-control',
			content: (
				<>
					<div style={box('blue', 1, true)} />
					<div>
						<div style={box('red', 10)} />
					</div>
				</>
			),
		},
		{
			id: 'clipped',
			content: (
				<div
					style={{
						position: 'absolute',
						left: 20,
						top: 20,
						width: 100,
						height: 100,
						overflow: 'hidden',
						isolation: 'isolate',
					}}
				>
					<div style={{...box('red', 2), left: 0, top: 0}} />
					<div style={{...box('blue', 1, true), left: 40, top: 40}} />
				</div>
			),
		},
		{
			id: 'flex-order',
			content: (
				<div
					style={{
						display: 'flex',
						position: 'absolute',
						inset: 20,
						isolation: 'isolate',
					}}
				>
					<div
						style={{
							width: 90,
							height: 90,
							flexShrink: 0,
							background: 'red',
							zIndex: 1,
							order: 2,
							marginLeft: -40,
						}}
					/>
					<div
						style={{
							width: 90,
							height: 90,
							flexShrink: 0,
							background: 'blue',
							zIndex: 1,
							order: 1,
						}}
					/>
				</div>
			),
		},
		{
			id: 'grid-order',
			content: (
				<div
					style={{
						display: 'grid',
						position: 'absolute',
						inset: 20,
						isolation: 'isolate',
					}}
				>
					<div
						style={{gridArea: '1 / 1', background: 'red', zIndex: 1, order: 2}}
					/>
					<div
						style={{
							gridArea: '1 / 1',
							margin: 20,
							background: 'blue',
							zIndex: 1,
							order: 1,
						}}
					/>
				</div>
			),
		},
		{
			id: 'display-contents-control',
			content: (
				<>
					<div
						style={{
							display: 'contents',
							position: 'relative',
							zIndex: 2,
							isolation: 'isolate',
						}}
					>
						<div style={box('red', 0)} />
					</div>
					<div style={box('blue', 1, true)} />
				</>
			),
		},
	];
	return (
		<AbsoluteFill>
			{scenes.map((scene, i) => (
				<div
					key={scene.id}
					style={{
						position: 'absolute',
						left: (i % 5) * 180,
						top: Math.floor(i / 5) * 180,
						width: 180,
						height: 180,
						isolation: 'isolate',
						background: 'white',
					}}
				>
					{scene.content}
				</div>
			))}
		</AbsoluteFill>
	);
};

export const stackingContextSiblings = {
	component: StackingContextSiblings,
	id: 'stacking-context-siblings',
	width: 900,
	height: 540,
	fps: 30,
	durationInFrames: 2,
} as const;
