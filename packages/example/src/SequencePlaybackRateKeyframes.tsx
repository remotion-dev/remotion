import type {CSSProperties, ReactNode} from 'react';
import {
	AbsoluteFill,
	interpolate,
	Sequence,
	Solid,
	useCurrentFrame,
} from 'remotion';

const lane: CSSProperties = {
	position: 'relative',
	width: 404,
	height: 44,
	backgroundColor: '#080c14',
	borderRadius: 6,
};

const Panel = ({title, children}: {title: string; children: ReactNode}) => (
	<div
		style={{
			backgroundColor: '#192332',
			border: '1px solid #35445a',
			borderRadius: 16,
			padding: 20,
			display: 'flex',
			flexDirection: 'column',
			gap: 12,
		}}
	>
		<div style={{fontSize: 26, fontWeight: 700}}>{title}</div>
		{children}
	</div>
);

const ChildClock = () => {
	const frame = useCurrentFrame();
	return (
		<>
			<div>Child clock: {frame} · source keys 0 → 60</div>
			<div style={lane}>
				<Solid
					name="Child clock · keys 0 to 60"
					width={44}
					height={44}
					color="#58d9c1"
					style={{
						translate: interpolate(frame, [0, 60], ['0px 0px', '360px 0px'], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					}}
				/>
			</div>
		</>
	);
};

const SlowClippedKeyframes = () => {
	const frame = useCurrentFrame();
	return (
		<>
			<div>Local frame: {frame} / target 60</div>
			<div style={lane}>
				<Solid
					name="Clipped animation · last keyframe outside duration"
					width={44}
					height={44}
					color="#ffc46b"
					style={{
						translate: interpolate(frame, [0, 60], ['0px 0px', '360px 0px'], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					}}
				/>
			</div>
		</>
	);
};

const TrimmedNestedKeyframes = () => {
	const frame = useCurrentFrame();
	return (
		<>
			<div>Local frame: {frame} · source keys 10, 30, 60</div>
			<div style={lane}>
				<Solid
					name="Nested trimmed animation · keys 10, 30, 60"
					width={44}
					height={44}
					color="#7eb4ff"
					style={{
						translate: interpolate(
							frame,
							[10, 30, 60],
							['0px 0px', '180px 0px', '360px 0px'],
							{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
						),
					}}
				/>
			</div>
		</>
	);
};

const HalfFrameKeyframes = () => {
	const frame = useCurrentFrame();
	return (
		<>
			<div>2× · raw local frame: {frame}</div>
			<div style={lane}>
				<Solid
					name="Half-frame peak · source key 15 at timeline 37.5"
					width={44}
					height={44}
					color="#df9eff"
					style={{
						translate: interpolate(
							frame,
							[14, 15, 16],
							['0px 0px', '360px 0px', '0px 0px'],
							{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
						),
					}}
				/>
			</div>
		</>
	);
};

const DecimalRateKeyframes = () => {
	const frame = useCurrentFrame();
	return (
		<>
			<div>3.1× · raw local frame: {frame}</div>
			<div style={lane}>
				<Solid
					name="Decimal-rate peak · source key 15"
					width={44}
					height={44}
					color="#ff9a85"
					style={{
						translate: interpolate(
							frame,
							[0, 15, 30],
							['0px 0px', '360px 0px', '0px 0px'],
							{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
						),
					}}
				/>
			</div>
		</>
	);
};

export const SequencePlaybackRateKeyframes = () => {
	// This clock belongs to the composition, even when used in nested JSX below.
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#0d1420',
				color: '#edf4ff',
				fontFamily: 'sans-serif',
				fontSize: 20,
				padding: 32,
				gap: 20,
			}}
		>
			<div style={{fontSize: 36, fontWeight: 700}}>
				Playback rate: keyframe surprises
			</div>
			<div style={{fontVariantNumeric: 'tabular-nums'}}>
				Composition frame: {frame} · Try frames 37, 38, 60, 119, 120
			</div>
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: '1fr 1fr',
					gridTemplateRows: '1fr 1fr',
					gap: 24,
					flex: 1,
				}}
			>
				<Panel title="1. Which component owns the clock?">
					<div>Both sequences are 2× and start at composition frame 30.</div>
					<div>Parent clock: {frame} · source keys 30 → 90</div>
					<div style={lane}>
						<Sequence
							name="Parent clock · own 2× does not retime its style"
							from={30}
							durationInFrames={150}
							playbackRate={2}
							style={{
								width: 44,
								height: 44,
								backgroundColor: '#7eb4ff',
								translate: interpolate(
									frame,
									[30, 90],
									['0px 0px', '360px 0px'],
									{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
								),
							}}
						/>
					</div>
					<Sequence
						name="Child clock parent · 2×"
						from={30}
						durationInFrames={150}
						playbackRate={2}
						layout="none"
					>
						<ChildClock />
					</Sequence>
					<div>
						At frame 60: parent animation is halfway; child animation is
						finished.
					</div>
					<div>JSX nesting does not change a captured frame variable.</div>
				</Panel>
				<Panel title="2. Slower playback can hide the last keyframe">
					<div>from=30 · durationInFrames=90 · playbackRate=0.5</div>
					<div>
						Duration stays in parent frames. Source key 60 maps to composition
						frame 150, after this sequence ends.
					</div>
					<Sequence
						name="Slow sequence · ends at 120 before its last keyframe"
						from={30}
						durationInFrames={90}
						playbackRate={0.5}
						layout="none"
					>
						<SlowClippedKeyframes />
					</Sequence>
					<div>
						At frame 119: local frame 44.5. At 120: the animation disappears
						before reaching its target.
					</div>
					<div>
						Extend the duration when you want the slower animation to finish.
					</div>
				</Panel>
				<Panel title="3. Source keyframes ≠ timeline positions">
					<div>
						Parent: from=30, rate=2. Child: from=20, trimBefore=10, rate=0.5.
					</div>
					<Sequence
						name="Nested keyframes parent · from 30 · 2×"
						from={30}
						durationInFrames={150}
						playbackRate={2}
						layout="none"
					>
						<Sequence
							name="Nested keyframes child · from 20 · trim 10 · 0.5×"
							from={20}
							trimBefore={10}
							durationInFrames={200}
							playbackRate={0.5}
							layout="none"
						>
							<TrimmedNestedKeyframes />
						</Sequence>
					</Sequence>
					<div>
						Source keys 10 / 30 / 60 appear at composition frames 40 / 60 / 90.
					</div>
					<div>
						The rates cancel to 1×, but the starts and trim still shift the
						animation.
					</div>
					<div>
						Drag a keyframe in Studio, then inspect the saved source frame.
					</div>
				</Panel>
				<Panel title="4. Fractional positions and precision">
					<Sequence
						name="Half-frame keyframe parent · from 30 · 2×"
						from={30}
						durationInFrames={150}
						playbackRate={2}
						layout="none"
					>
						<HalfFrameKeyframes />
					</Sequence>
					<div>
						Keys 14 / 15 / 16 form a pulse at frames 37 / 37.5 / 38. Rendering
						skips its peak; the inspector rounds 37.5 to 38.
					</div>
					<Sequence
						name="Decimal keyframe parent · from 30 · 3.1×"
						from={30}
						durationInFrames={150}
						playbackRate={3.1}
						layout="none"
					>
						<DecimalRateKeyframes />
					</Sequence>
					<div>
						Seek to 30, select the orange square, then Next keyframe. Source key
						15 lands at 34.8387… but the toggle incorrectly shows Add keyframe.
					</div>
				</Panel>
			</div>
		</AbsoluteFill>
	);
};
