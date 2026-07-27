import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {pushCut} from '@remotion/transitions/push-cut';
import {
	AbsoluteFill,
	Easing,
	Sequence,
	interpolate,
	useCurrentFrame,
} from 'remotion';

const TRANSITION_DURATION_IN_FRAMES = 11;
const OUTGOING_PUNCH_FRAMES = 5;
const CUT_PROGRESS = OUTGOING_PUNCH_FRAMES / TRANSITION_DURATION_IN_FRAMES;
const SCENE_DURATION_IN_FRAMES = 90;

const clamp = {
	extrapolateLeft: 'clamp',
	extrapolateRight: 'clamp',
} as const;

const GeneratedScene: React.FC<{
	background: string;
	accent: string;
	eyebrow: string;
	title: string;
	reverse?: boolean;
}> = ({background, accent, eyebrow, title, reverse = false}) => {
	const frame = useCurrentFrame();
	const drift = interpolate(frame, [0, 90], [0, reverse ? -120 : 120], clamp);
	const ringScale = interpolate(frame, [0, 30], [0.75, 1], {
		...clamp,
		easing: Easing.out(Easing.cubic),
	});

	return (
		<AbsoluteFill
			style={{
				alignItems: 'center',
				background,
				color: '#f8f7f4',
				fontFamily: 'Arial, Helvetica, sans-serif',
				justifyContent: 'center',
				overflow: 'hidden',
			}}
		>
			<div
				style={{
					border: `20px solid ${accent}`,
					borderRadius: '50%',
					height: 620,
					opacity: 0.92,
					position: 'absolute',
					right: reverse ? 'auto' : -100 + drift,
					left: reverse ? -100 + drift : 'auto',
					transform: `scale(${ringScale})`,
					width: 620,
				}}
			/>
			<div
				style={{
					background: accent,
					height: 2,
					left: 0,
					opacity: 0.7,
					position: 'absolute',
					top: '18%',
					transform: `translateX(${drift}px)`,
					width: '58%',
				}}
			/>
			<div style={{position: 'relative', textAlign: 'center'}}>
				<div
					style={{
						color: accent,
						fontSize: 30,
						fontWeight: 700,
						letterSpacing: 8,
						marginBottom: 22,
						textTransform: 'uppercase',
					}}
				>
					{eyebrow}
				</div>
				<div
					style={{
						fontSize: 156,
						fontWeight: 900,
						letterSpacing: -9,
						lineHeight: 0.9,
					}}
				>
					{title}
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const PushCutDemo: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: '#0b1020'}}>
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={SCENE_DURATION_IN_FRAMES}>
					<GeneratedScene
						accent="#ffb35c"
						background="#17122b"
						eyebrow="Outgoing scene"
						title="PUSH"
					/>
				</TransitionSeries.Sequence>

				<TransitionSeries.Transition
					presentation={pushCut({
						cutProgress: CUT_PROGRESS,
						transformOrigin: '50% 58%',
					})}
					timing={linearTiming({
						durationInFrames: TRANSITION_DURATION_IN_FRAMES,
					})}
				/>

				<TransitionSeries.Sequence
					durationInFrames={SCENE_DURATION_IN_FRAMES + OUTGOING_PUNCH_FRAMES}
				>
					{/**
					 * TransitionSeries overlaps both scenes. Delaying the incoming
					 * content by the pre-cut portion keeps its local frame 0 aligned
					 * with the hard cut instead of consuming hidden preroll.
					 */}
					<Sequence from={OUTGOING_PUNCH_FRAMES}>
						<GeneratedScene
							accent="#7df6d0"
							background="#082734"
							eyebrow="Incoming scene"
							reverse
							title="CUT"
						/>
					</Sequence>
				</TransitionSeries.Sequence>
			</TransitionSeries>
		</AbsoluteFill>
	);
};

export const PUSH_CUT_DEMO_DURATION_IN_FRAMES =
	SCENE_DURATION_IN_FRAMES +
	(SCENE_DURATION_IN_FRAMES + OUTGOING_PUNCH_FRAMES) -
	TRANSITION_DURATION_IN_FRAMES;
