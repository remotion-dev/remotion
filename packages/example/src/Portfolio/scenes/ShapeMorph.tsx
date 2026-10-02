import {evolvePath, interpolatePaths} from '@remotion/paths';
import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Freeze,
	Interactive,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {ChapterTag} from '../components/ChapterTag';
import {RiseText} from '../components/RiseText';
import {pad} from '../pad';
import {colors, mono, sans, serif} from '../theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const forms = [
	{at: 0, name: 'CIRCLE'},
	{at: 51, name: 'SQUARE'},
	{at: 81, name: 'TRIANGLE'},
	{at: 111, name: 'STAR'},
	{at: 141, name: 'HEART'},
	{at: 171, name: 'CIRCLE'},
];

type MorphShapeProps = {
	readonly fill: string;
	readonly stroke: string;
	readonly strokeWidth: number;
	readonly opacity: number;
};

// Circle → square → triangle → star → heart → circle, one morph every two beats.
const MorphShape: React.FC<MorphShapeProps> = ({
	fill,
	stroke,
	strokeWidth,
	opacity,
}) => {
	const frame = useCurrentFrame();

	return (
		<Interactive.Path
			name="Morphing shape"
			d={interpolatePaths(
				frame,
				[45, 57, 75, 87, 105, 117, 135, 147, 165, 177],
				[
					'M 400 150 C 538 150 650 262 650 400 C 650 538 538 650 400 650 C 262 650 150 538 150 400 C 150 262 262 150 400 150 Z',
					'M 400 180 L 564 180 Q 620 180 620 236 L 620 564 Q 620 620 564 620 L 236 620 Q 180 620 180 564 L 180 236 Q 180 180 236 180 Z',
					'M 400 180 L 564 180 Q 620 180 620 236 L 620 564 Q 620 620 564 620 L 236 620 Q 180 620 180 564 L 180 236 Q 180 180 236 180 Z',
					'M 400 150 L 680 635 L 120 635 Z',
					'M 400 150 L 680 635 L 120 635 Z',
					'M 400 140 L 469.4 324.5 L 666.3 333.5 L 512.2 456.5 L 564.6 646.5 L 400 538 L 235.4 646.5 L 287.8 456.5 L 133.7 333.5 L 330.6 324.5 Z',
					'M 400 140 L 469.4 324.5 L 666.3 333.5 L 512.2 456.5 L 564.6 646.5 L 400 538 L 235.4 646.5 L 287.8 456.5 L 133.7 333.5 L 330.6 324.5 Z',
					'M 400 270 C 440 190 540 170 600 220 C 670 280 650 390 580 460 L 400 640 L 220 460 C 150 390 130 280 200 220 C 260 170 360 190 400 270 Z',
					'M 400 270 C 440 190 540 170 600 220 C 670 280 650 390 580 460 L 400 640 L 220 460 C 150 390 130 280 200 220 C 260 170 360 190 400 270 Z',
					'M 400 150 C 538 150 650 262 650 400 C 650 538 538 650 400 650 C 262 650 150 538 150 400 C 150 262 262 150 400 150 Z',
				],
				{
					easing: Easing.bezier(0.65, 0, 0.35, 1),
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				},
			)}
			fill={fill}
			stroke={stroke}
			strokeWidth={strokeWidth}
			strokeLinejoin="round"
			opacity={opacity}
		/>
	);
};

const Dial: React.FC = () => {
	const frame = useCurrentFrame();
	const ring = evolvePath(
		interpolate(frame, [16, 54], [0, 1], {
			...clamp,
			easing: Easing.bezier(0.65, 0, 0.35, 1),
		}),
		'M 400 30 A 370 370 0 1 1 399.99 30',
	);
	const ticksIn = interpolate(frame, [30, 60], [0, 1], clamp);

	return (
		<>
			<path
				d="M 400 30 A 370 370 0 1 1 399.99 30"
				fill="none"
				stroke={colors.paper}
				strokeOpacity={0.3}
				strokeWidth={1.5}
				strokeDasharray={ring.strokeDasharray}
				strokeDashoffset={ring.strokeDashoffset}
			/>
			<g
				style={{
					rotate: `${-frame * 0.35}deg`,
					transformOrigin: '400px 400px',
					opacity: ticksIn,
				}}
			>
				{new Array(72).fill(true).map((_, i) => {
					const angle = (i / 72) * Math.PI * 2;
					const long = i % 6 === 0;
					const inner = long ? 336 : 346;
					return (
						<line
							key={i}
							x1={400 + Math.cos(angle) * inner}
							y1={400 + Math.sin(angle) * inner}
							x2={400 + Math.cos(angle) * 356}
							y2={400 + Math.sin(angle) * 356}
							stroke={colors.paper}
							strokeOpacity={long ? 0.55 : 0.22}
							strokeWidth={long ? 2 : 1.5}
						/>
					);
				})}
			</g>
			<circle
				cx={400}
				cy={400}
				r={300}
				fill="none"
				stroke={colors.accent}
				strokeOpacity={0.6}
				strokeWidth={2}
				strokeDasharray="3 15"
				style={{
					rotate: `${frame * 0.6}deg`,
					transformOrigin: '400px 400px',
					opacity: interpolate(frame, [26, 46], [0, 1], clamp),
				}}
			/>
			<circle
				cx={400 + Math.cos(((frame * 1.6 - 90) * Math.PI) / 180) * 370}
				cy={400 + Math.sin(((frame * 1.6 - 90) * Math.PI) / 180) * 370}
				r={9}
				fill={colors.accent}
				opacity={interpolate(frame, [40, 50], [0, 1], clamp)}
			/>
			<circle
				cx={400 + Math.cos(((90 - frame * 2.4) * Math.PI) / 180) * 300}
				cy={400 + Math.sin(((90 - frame * 2.4) * Math.PI) / 180) * 300}
				r={6}
				fill={colors.paper}
				opacity={interpolate(frame, [46, 56], [0, 1], clamp)}
			/>
		</>
	);
};

const SpecRow: React.FC<{
	readonly index: string;
	readonly label: string;
	readonly detail: string;
	readonly start: number;
}> = ({index, label, detail, start}) => {
	const frame = useCurrentFrame();
	const progress = interpolate(frame, [start, start + 18], [0, 1], {
		...clamp,
		easing: Easing.bezier(0.16, 1, 0.3, 1),
	});

	return (
		<div
			style={{
				display: 'flex',
				gap: 28,
				alignItems: 'baseline',
				fontFamily: mono,
				fontSize: 26,
				letterSpacing: '0.06em',
				color: colors.paper,
				opacity: progress,
				translate: `${(1 - progress) * -30}px 0`,
				borderTop: '1px solid rgba(243, 239, 230, 0.18)',
				paddingTop: 18,
				width: 640,
			}}
		>
			<span style={{color: colors.accent, fontWeight: 700}}>{index}</span>
			<span style={{fontWeight: 700, width: 110}}>{label}</span>
			<span style={{opacity: 0.6}}>{detail}</span>
		</div>
	);
};

export const ShapeMorph: React.FC = () => {
	const frame = useCurrentFrame();
	const form = [...forms].reverse().find((f) => frame >= f.at) ?? forms[0];

	return (
		<AbsoluteFill style={{backgroundColor: '#0B0B0F'}}>
			<AbsoluteFill
				style={{
					backgroundImage:
						'radial-gradient(circle, rgba(243, 239, 230, 0.16) 1.6px, transparent 2px)',
					backgroundSize: '48px 48px',
					backgroundPosition: '24px 24px',
					opacity: interpolate(frame, [0, 30], [0, 1], clamp),
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left: 140,
					top: 190,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'flex-start',
				}}
			>
				<RiseText
					name="Shape"
					text="Shape"
					start={16}
					stagger={3}
					style={{
						fontFamily: sans,
						fontWeight: 800,
						fontSize: 204,
						lineHeight: 0.8,
						letterSpacing: '-0.05em',
						color: colors.paper,
						paddingTop: 12,
					}}
				/>
				<RiseText
					name="& path."
					text="& path."
					start={24}
					stagger={3}
					style={{
						fontFamily: serif,
						fontStyle: 'italic',
						fontSize: 214,
						lineHeight: 0.9,
						color: colors.accent,
						paddingRight: 24,
						paddingBottom: '0.16em',
						marginTop: 6,
						marginBottom: '-0.16em',
					}}
				/>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						gap: 18,
						marginTop: 70,
					}}
				>
					<SpecRow
						index="01"
						label="MORPH"
						detail="interpolatePaths()"
						start={40}
					/>
					<SpecRow index="02" label="DRAW" detail="evolvePath()" start={46} />
					<SpecRow
						index="03"
						label="ECHO"
						detail="<Freeze> onion skin"
						start={52}
					/>
				</div>
			</div>
			<svg
				width={800}
				height={800}
				viewBox="0 0 800 800"
				style={{position: 'absolute', left: 920, top: 140, overflow: 'visible'}}
			>
				<line
					x1={-40}
					y1={400}
					x2={840}
					y2={400}
					stroke={colors.paper}
					strokeOpacity={0.14}
					style={{
						scale: `${interpolate(frame, [14, 44], [0, 1], {...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1)})} 1`,
						transformOrigin: '400px 400px',
					}}
				/>
				<line
					x1={400}
					y1={-40}
					x2={400}
					y2={840}
					stroke={colors.paper}
					strokeOpacity={0.14}
					style={{
						scale: `1 ${interpolate(frame, [18, 48], [0, 1], {...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1)})}`,
						transformOrigin: '400px 400px',
					}}
				/>
				<Dial />
				<Interactive.G
					name="Shape pop"
					style={{
						transformOrigin: '400px 400px',
						scale: interpolate(
							frame,
							[
								14, 40, 45, 50, 57, 63, 75, 80, 87, 93, 105, 110, 117, 123, 135,
								140, 147, 153, 165, 170, 177, 183,
							],
							[
								0, 1, 1, 0.86, 1.08, 1, 1, 0.86, 1.08, 1, 1, 0.86, 1.08, 1, 1,
								0.86, 1.08, 1, 1, 0.86, 1.08, 1,
							],
							{
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
								easing: Easing.bezier(0.45, 0, 0.55, 1),
							},
						),
					}}
				>
					<Freeze frame={Math.max(0, frame - 12)}>
						<MorphShape
							fill="none"
							stroke={colors.paper}
							strokeWidth={2.5}
							opacity={0.16}
						/>
					</Freeze>
					<Freeze frame={Math.max(0, frame - 8)}>
						<MorphShape
							fill="none"
							stroke={colors.paper}
							strokeWidth={2.5}
							opacity={0.3}
						/>
					</Freeze>
					<Freeze frame={Math.max(0, frame - 4)}>
						<MorphShape
							fill="none"
							stroke={colors.paper}
							strokeWidth={2.5}
							opacity={0.5}
						/>
					</Freeze>
					<MorphShape
						fill={colors.accent}
						stroke="none"
						strokeWidth={0}
						opacity={1}
					/>
				</Interactive.G>
			</svg>
			<div
				style={{
					position: 'absolute',
					right: 140,
					top: 150,
					textAlign: 'right',
					fontFamily: mono,
					fontSize: 22,
					letterSpacing: '0.16em',
					lineHeight: 1.7,
					color: colors.paper,
					opacity: interpolate(frame, [34, 48], [0, 0.75], clamp),
				}}
			>
				<div>FORM — {form.name}</div>
				<div style={{opacity: 0.55}}>{pad(forms.indexOf(form) + 1)} / 06</div>
			</div>
			<ChapterTag
				name="Shape & path chapter tag"
				index="02"
				title="Shape & path"
				color={colors.paper}
				start={20}
			/>
		</AbsoluteFill>
	);
};
