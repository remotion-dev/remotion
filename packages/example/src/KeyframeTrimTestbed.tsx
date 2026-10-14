import {blur} from '@remotion/effects/blur';
import {Audio, Video} from '@remotion/media';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import type {ReactNode} from 'react';
import {
	AbsoluteFill,
	Easing,
	Interactive,
	interpolate,
	Sequence,
	Series,
	Solid,
	staticFile,
	Track,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const Card = ({
	title,
	limit,
	description,
	children,
}: {
	readonly title: string;
	readonly limit: string;
	readonly description: string;
	readonly children: ReactNode;
}) => (
	<div
		style={{
			backgroundColor: '#172033',
			border: '1px solid #34425a',
			borderRadius: 18,
			padding: 16,
			minHeight: 0,
			display: 'flex',
			flexDirection: 'column',
			gap: 8,
		}}
	>
		<div style={{fontSize: 21, fontWeight: 700}}>{title}</div>
		<div style={{fontSize: 18, color: '#8ee6c1', fontWeight: 600}}>{limit}</div>
		<div
			style={{fontSize: 16, color: '#bac5d6', lineHeight: 1.4, minHeight: 44}}
		>
			{description}
		</div>
		<div
			style={{
				position: 'relative',
				flex: 1,
				minHeight: 60,
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: '#0d1422',
				borderRadius: 12,
			}}
		>
			{children}
		</div>
	</div>
);

const Clock = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	return (
		<div
			style={{
				position: 'absolute',
				bottom: 10,
				left: 0,
				right: 0,
				textAlign: 'center',
				fontSize: 16,
				color: '#9eacc0',
				fontVariantNumeric: 'tabular-nums',
			}}
		>
			Local frame {Math.round(frame * 100) / 100} · duration {durationInFrames}
		</div>
	);
};

// Issue #12153: these four input frames stop increasing below 40 frames.
// The ordinary SVG circle deliberately has no editable property schema.
const CircleContent = () => {
	const frame = useCurrentFrame();
	const {durationInFrames, fps} = useVideoConfig();
	return (
		<>
			<Interactive.Svg
				name="SVG child with duration-dependent radius"
				viewBox="0 0 64 60"
				width={128}
				height={120}
				style={{marginBottom: 24}}
				premountFor={fps}
			>
				<circle
					cx="32"
					cy="30"
					r="22"
					fill="none"
					stroke="#34425a"
					strokeWidth="0.6"
				/>
				<circle
					cx="32"
					cy="30"
					r={interpolate(
						frame,
						[10, 21, durationInFrames - 18, durationInFrames - 8],
						[0, 9, 9, 0],
						{
							easing: Easing.out(Easing.cubic),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						},
					)}
					fill="#8ee6c1"
				/>
			</Interactive.Svg>
			<Clock />
		</>
	);
};

const PropertyContent = () => {
	const frame = useCurrentFrame();
	const {durationInFrames, fps} = useVideoConfig();
	return (
		<>
			<Solid
				name="Opacity keyframes"
				width={120}
				height={100}
				color="#77b4ff"
				premountFor={fps}
				style={{
					borderRadius: 18,
					marginBottom: 24,
					opacity: interpolate(
						frame,
						[10, 21, durationInFrames - 18, durationInFrames - 8],
						[0.2, 1, 1, 0.2],
						{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
					),
				}}
			/>
			<Clock />
		</>
	);
};

const EffectContent = () => {
	const frame = useCurrentFrame();
	const {durationInFrames, fps} = useVideoConfig();
	return (
		<>
			<Solid
				name="Blur effect keyframes"
				width={120}
				height={100}
				color="#ffbf83"
				premountFor={fps}
				style={{borderRadius: 18, marginBottom: 24}}
				effects={[
					blur({
						radius: interpolate(
							frame,
							[10, 21, durationInFrames - 18, durationInFrames - 8],
							[12, 0, 0, 12],
							{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
						),
					}),
				]}
			/>
			<Clock />
		</>
	);
};

const NestedContent = () => {
	const {fps} = useVideoConfig();
	return (
		<Sequence
			name="Child: from 10, playback rate 2"
			from={10}
			durationInFrames={120}
			playbackRate={2}
			style={{justifyContent: 'center', alignItems: 'center'}}
			premountFor={fps}
		>
			<CircleContent />
		</Sequence>
	);
};

const MaximumContent = () => {
	const frame = useCurrentFrame();
	const {durationInFrames, fps} = useVideoConfig();
	return (
		<>
			<Solid
				name="Bounded opacity keyframes"
				width={120}
				height={100}
				color="#cfabff"
				premountFor={fps}
				style={{
					borderRadius: 18,
					marginBottom: 24,
					opacity: interpolate(
						frame,
						[0, 10, durationInFrames, 90],
						[0.2, 1, 1, 0.2],
						{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
					),
				}}
			/>
			<Clock />
		</>
	);
};

const UnknownArithmeticContent = () => {
	const frame = useCurrentFrame();
	const {durationInFrames, fps} = useVideoConfig();
	return (
		<>
			<Solid
				name="Computed input range"
				width={120}
				height={100}
				color="#ff8eac"
				premountFor={fps}
				style={{
					borderRadius: 18,
					marginBottom: 24,
					opacity: interpolate(
						frame,
						[0, 10, Math.max(11, durationInFrames - 18), durationInFrames - 8],
						[0.2, 1, 1, 0.2],
						{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
					),
				}}
			/>
			<Clock />
		</>
	);
};

export const KeyframeTrimTestbed = () => {
	const {fps} = useVideoConfig();
	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#0b1120',
				color: '#eef3fb',
				fontFamily: 'Arial, sans-serif',
				padding: 40,
				gap: 24,
			}}
		>
			<div style={{fontSize: 42, fontWeight: 700}}>Timeline trim limits</div>
			<div style={{fontSize: 22, color: '#bac5d6', lineHeight: 1.5}}>
				Each card names the expected feedback and the handle to drag. Rows 1–6
				exercise keyframes; rows 7–16 cover the remaining boundaries. Seek back
				inside shortened clips to see their content.
			</div>
			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(4, 1fr)',
					gridTemplateRows: 'repeat(4, minmax(0, 1fr))',
					gap: 18,
					minHeight: 0,
					flex: 1,
				}}
			>
				<Card
					title="1. Plain SVG child"
					limit="Keyframe constraint · minimum 40"
					description="Original circle-radius reproduction. No schema on the animated circle."
				>
					<Sequence
						name="1. SVG child — minimum 40"
						durationInFrames={40}
						style={{justifyContent: 'center', alignItems: 'center'}}
						premountFor={fps}
					>
						<CircleContent />
					</Sequence>
				</Card>
				<Card
					title="2. Element property"
					limit="Keyframe constraint · minimum 40"
					description="Opacity is animated on an editable Solid property."
				>
					<Sequence
						name="2. Property — minimum 40"
						durationInFrames={40}
						style={{justifyContent: 'center', alignItems: 'center'}}
						premountFor={fps}
					>
						<PropertyContent />
					</Sequence>
				</Card>
				<Card
					title="3. Effect property"
					limit="Keyframe constraint · minimum 40"
					description="The same input range drives a blur effect's radius."
				>
					<Sequence
						name="3. Effect — minimum 40"
						durationInFrames={54}
						style={{justifyContent: 'center', alignItems: 'center'}}
						premountFor={fps}
					>
						<EffectContent />
					</Sequence>
				</Card>
				<Card
					title="4. Nested child"
					limit="Keyframe constraint · parent minimum 30"
					description="Child starts at 10 and plays at 2×. Its local duration must stay at least 40."
				>
					<Sequence
						name="4. Nested parent — minimum 30"
						durationInFrames={38}
						style={{justifyContent: 'center', alignItems: 'center'}}
						premountFor={fps}
					>
						<NestedContent />
					</Sequence>
				</Card>
				<Card
					title="5. Maximum duration"
					limit="Keyframe constraint · range 11–89"
					description="Input range [0, 10, duration, 90]. Try extending the right edge past 89."
				>
					<Sequence
						name="5. Upper bound — maximum 89"
						durationInFrames={60}
						style={{justifyContent: 'center', alignItems: 'center'}}
						premountFor={fps}
					>
						<MaximumContent />
					</Sequence>
				</Card>
				<Card
					title="6. Unresolved arithmetic"
					limit="Computed keyframes · stays at 90"
					description="Math.max() in the range cannot be solved statically. Resizing stays locked."
				>
					<Sequence
						name="6. Computed range — locked at 90"
						durationInFrames={90}
						style={{justifyContent: 'center', alignItems: 'center'}}
						premountFor={fps}
					>
						<UnknownArithmeticContent />
					</Sequence>
				</Card>
				<Card
					title="7. One-frame minimum"
					limit="Green glow only · one-frame minimum"
					description="Drag the right edge left until only one frame remains."
				>
					<Sequence name="7. Minimum duration" durationInFrames={60}>
						<Clock />
					</Sequence>
				</Card>
				<Card
					title="8. Transition overlap"
					limit="Transition limit"
					description="Shorten clip A with its right edge. The 20-frame fade sets its minimum."
				>
					<TransitionSeries name="8. Transition container">
						<TransitionSeries.Sequence
							name="8. Transition limit — clip A"
							durationInFrames={60}
						>
							<Clock />
						</TransitionSeries.Sequence>
						<TransitionSeries.Transition
							presentation={fade()}
							timing={linearTiming({durationInFrames: 20})}
						/>
						<TransitionSeries.Sequence
							name="8. Transition clip B"
							durationInFrames={60}
						>
							<Clock />
						</TransitionSeries.Sequence>
					</TransitionSeries>
				</Card>
				<Card
					title="9. Source beginning"
					limit="Green glow only · source start"
					description="Drag the left edge left. Its 15 trimmed frames can be restored, then it stops."
				>
					<Sequence
						name="9. Source start"
						from={20}
						trimBefore={15}
						durationInFrames={60}
						premountFor={fps}
					>
						<Clock />
					</Sequence>
				</Card>
				<Card
					title="10. Media ending"
					limit="Green glow only · source end"
					description="Extend the audio's right edge. The local 56-frame file ends before the composition."
				>
					<Audio
						name="10. Source end"
						src={staticFile('22khz.wav')}
						trimBefore={5}
						durationInFrames={51}
						muted
					/>
					<Clock />
				</Card>
				<Card
					title="11. Parent boundary"
					limit="Green glow only · parent edge"
					description="Extend the child's right edge to frame 90, where its parent ends."
				>
					<Sequence name="11. Parent — 90 frames" durationInFrames={90}>
						<Sequence
							name="11. Parent edge — child"
							from={10}
							durationInFrames={40}
						>
							<Clock />
						</Sequence>
					</Sequence>
				</Card>
				<Card
					title="12. Composition boundary"
					limit="Green glow only · composition edge"
					description="Extend the right edge to frame 180, the end of this composition."
				>
					<Sequence name="12. Composition edge" from={15} durationInFrames={75}>
						<Clock />
					</Sequence>
				</Card>
				<Card
					title="13. Neighboring clips"
					limit="Green glow only · adjacent clip"
					description="Extend clip A to frame 80, where clip B starts on the same track."
				>
					<Track name="13. Adjacent clips">
						<Sequence name="13. Adjacent clip — A" durationInFrames={50}>
							<Clock />
						</Sequence>
						<Sequence
							name="13. Adjacent clip — B"
							from={80}
							durationInFrames={50}
							premountFor={fps * 6}
						>
							<Clock />
						</Sequence>
					</Track>
				</Card>
				<Card
					title="14. Inferred content ending"
					limit="Green glow only · content end"
					description="Its two 45-frame children give the Series a content duration of 90 frames."
				>
					<Series name="14. Content end" durationInFrames={50}>
						<Series.Sequence name="14. Content A" durationInFrames={45}>
							<Clock />
						</Series.Sequence>
						<Series.Sequence name="14. Content B" durationInFrames={45}>
							<Clock />
						</Series.Sequence>
					</Series>
				</Card>
				<Card
					title="15. Unavailable media metadata"
					limit="Unknown media duration"
					description="Drag the inner source-start handle left. This deliberately invalid media has no known end."
				>
					<Video
						name="15. Unknown media duration"
						src={staticFile('example.txt')}
						trimBefore={15}
						durationInFrames={60}
						onError={() => 'fallback'}
						fallbackOffthreadVideoProps={{
							onError: () => undefined,
							pauseWhenBuffering: false,
						}}
						muted
						style={{width: 1, height: 1}}
					/>
					<Clock />
				</Card>
				<Card
					title="16. Clipped-start fallback"
					limit="Green glow only · fallback"
					description="Cmd/Ctrl-select the clipped child and handle row, then drag the handle row's left edge left by 30 frames."
				>
					<Sequence name="16. Clipped parent" from={-30} durationInFrames={150}>
						<Sequence
							name="16. Trim limit — child"
							from={20}
							trimBefore={60}
							durationInFrames={60}
						>
							<Clock />
						</Sequence>
					</Sequence>
					<Sequence
						name="16. Trim limit — drag handle"
						from={45}
						trimBefore={100}
						durationInFrames={60}
						premountFor={fps * 6}
					/>
				</Card>
			</div>
			<div style={{fontSize: 18, color: '#8495ad'}}>
				Also try values outside the allowed range in the Duration inspector, or
				select several numbered rows and trim them together.
			</div>
		</AbsoluteFill>
	);
};
