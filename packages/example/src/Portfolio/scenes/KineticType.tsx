import {evolvePath} from '@remotion/paths';
import React, {useId} from 'react';
import {
	AbsoluteFill,
	Easing,
	Interactive,
	interpolate,
	random,
	useCurrentFrame,
} from 'remotion';
import {ChapterTag} from '../components/ChapterTag';
import {RiseText} from '../components/RiseText';
import {Sparkle} from '../components/Sparkle';
import {BEAT, colors, mono, sans, serif} from '../theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const wordStyle: React.CSSProperties = {
	fontFamily: sans,
	fontWeight: 900,
	fontSize: 232,
	lineHeight: 0.84,
	letterSpacing: '-0.045em',
	color: colors.ink,
};

// Letters flip up on their baseline, then hop on the given beats.
const FlipText: React.FC<{
	readonly text: string;
	readonly start: number;
	readonly hops: readonly number[];
}> = ({text, start, hops}) => {
	const frame = useCurrentFrame();

	return (
		<span style={{...wordStyle, display: 'inline-flex', perspective: 900}}>
			{Array.from(text).map((char, i) => {
				const enterAt = start + i * 3;
				const flip = interpolate(frame, [enterAt, enterAt + 18], [-105, 0], {
					...clamp,
					easing: Easing.spring({damping: 11}),
				});
				const hop = hops.reduce((sum, beat) => {
					const at = beat + i * 2;
					return (
						sum +
						interpolate(frame, [at, at + 5, at + 12], [0, -44, 0], {
							...clamp,
							easing: [Easing.out(Easing.quad), Easing.in(Easing.quad)],
						})
					);
				}, 0);

				return (
					<span
						key={i}
						style={{
							display: 'inline-block',
							transformOrigin: '50% 100%',
							transform: `translateY(${hop}px) rotateX(${flip}deg)`,
							opacity: interpolate(
								frame,
								[enterAt, enterAt + 3],
								[0, 1],
								clamp,
							),
						}}
					>
						{char}
					</span>
				);
			})}
		</span>
	);
};

const CircularBadge: React.FC = () => {
	const frame = useCurrentFrame();
	const id = `badge-${useId().replace(/:/g, '')}`;

	return (
		<svg width={340} height={340} viewBox="0 0 340 340">
			<defs>
				<path
					id={id}
					d="M 170 170 m -128 0 a 128 128 0 1 1 256 0 a 128 128 0 1 1 -256 0"
				/>
			</defs>
			<g
				style={{
					rotate: `${frame * 1.4}deg`,
					transformOrigin: '170px 170px',
				}}
			>
				<text
					fill={colors.ink}
					style={{
						fontFamily: mono,
						fontSize: 25,
						fontWeight: 700,
						letterSpacing: '0.14em',
					}}
				>
					<textPath href={`#${id}`} textLength={796} lengthAdjust="spacing">
						KINETIC TYPE • RHYTHM • TIMING • MOTION •
					</textPath>
				</text>
			</g>
			<g
				style={{
					rotate: `${-frame * 3}deg`,
					transformOrigin: '170px 170px',
				}}
			>
				<path
					d="M 170 108 C 173 150 190 167 232 170 C 190 173 173 190 170 232 C 167 190 150 173 108 170 C 150 167 167 150 170 108 Z"
					fill={colors.ink}
				/>
			</g>
		</svg>
	);
};

const BeatMeter: React.FC = () => {
	const frame = useCurrentFrame();
	const activeBeat = Math.floor(frame / BEAT) % 8;

	return (
		<div style={{display: 'flex', alignItems: 'center', gap: 22}}>
			<span
				style={{
					fontFamily: mono,
					fontSize: 24,
					fontWeight: 700,
					letterSpacing: '0.16em',
					color: colors.ink,
				}}
			>
				120 BPM
			</span>
			<div style={{display: 'flex', gap: 10}}>
				{new Array(8).fill(true).map((_, i) => {
					const sinceBeat = frame - Math.floor(frame / BEAT) * BEAT;
					const isActive = i === activeBeat;
					return (
						<div
							key={i}
							style={{
								width: 22,
								height: 22,
								backgroundColor: isActive ? colors.ink : 'transparent',
								border: `2px solid ${colors.ink}`,
								scale: isActive
									? interpolate(sinceBeat, [0, 8], [1.35, 1], clamp)
									: 1,
							}}
						/>
					);
				})}
			</div>
		</div>
	);
};

const marqueeRows = [
	{text: 'KINETIC TYPE', look: 'fill', color: colors.paper, dir: -1, speed: 5},
	{
		text: 'TIMING & SPACING',
		look: 'outline',
		color: colors.paper,
		dir: 1,
		speed: 4,
	},
	{
		text: 'WORDS THAT MOVE',
		look: 'fill',
		color: colors.accent,
		dir: -1,
		speed: 7,
	},
	{
		text: 'RHYTHM IS EVERYTHING',
		look: 'tape',
		color: colors.ink,
		dir: 1,
		speed: 6,
	},
	{
		text: 'EASE IN — EASE OUT',
		look: 'outline',
		color: colors.accent,
		dir: -1,
		speed: 5,
	},
	{
		text: 'SQUASH & STRETCH',
		look: 'fill',
		color: colors.paper,
		dir: 1,
		speed: 4,
	},
	{
		text: 'KEYFRAMES & SPRINGS',
		look: 'outline',
		color: colors.paper,
		dir: -1,
		speed: 6,
	},
	{text: 'TYPOGRAPHY', look: 'fill', color: colors.accent, dir: 1, speed: 5},
] as const;

const MarqueeWall: React.FC = () => {
	const frame = useCurrentFrame();
	const zip = interpolate(frame, [200, 255], [0, 1], {
		...clamp,
		easing: Easing.in(Easing.cubic),
	});

	return (
		<div
			style={{
				position: 'absolute',
				left: '50%',
				top: '50%',
				width: 3400,
				translate: '-50% -50%',
				rotate: '-7deg',
				display: 'flex',
				flexDirection: 'column',
				gap: 4,
			}}
		>
			{marqueeRows.map((row, i) => {
				const flyIn = interpolate(frame, [118 + i * 2, 146 + i * 2], [1, 0], {
					...clamp,
					easing: Easing.bezier(0.16, 1, 0.3, 1),
				});
				const x =
					-5200 +
					((i * 537) % 1100) +
					row.dir * (row.speed * (frame - 120) + zip * 1600) -
					row.dir * flyIn * 1800;
				const isTape = row.look === 'tape';

				return (
					<div
						key={row.text}
						style={{
							height: 172,
							display: 'flex',
							alignItems: 'center',
							backgroundColor: isTape ? colors.paper : 'transparent',
							overflow: 'hidden',
						}}
					>
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: 48,
								paddingLeft: 48,
								whiteSpace: 'nowrap',
								translate: `${x}px 0`,
								fontFamily: sans,
								fontWeight: 900,
								fontSize: 150,
								letterSpacing: '-0.03em',
								lineHeight: 1,
								// Painting the stroke under an ink fill hides the variable
								// font's overlapping inner contours.
								color: row.look === 'outline' ? colors.ink : row.color,
								WebkitTextStroke:
									row.look === 'outline' ? `6px ${row.color}` : undefined,
								paintOrder: 'stroke fill',
							}}
						>
							{new Array(10).fill(true).map((_, k) => (
								<React.Fragment key={k}>
									<span>{row.text}</span>
									<Sparkle
										size={70}
										color={isTape ? colors.accent : row.color}
										rotate={frame * 4 * row.dir + k * 30}
									/>
								</React.Fragment>
							))}
						</div>
					</div>
				);
			})}
		</div>
	);
};

export const KineticType: React.FC = () => {
	const frame = useCurrentFrame();
	const shake = interpolate(frame, [10, 22], [1, 0], clamp);
	const peopleReveal = interpolate(frame, [60, 74], [0, 1], {
		...clamp,
		easing: Easing.bezier(0.33, 1, 0.68, 1),
	});
	const underline = evolvePath(
		interpolate(frame, [70, 90], [0, 1], {
			...clamp,
			easing: Easing.bezier(0.65, 0, 0.35, 1),
		}),
		'M 12 40 C 180 8 420 70 600 30 C 680 12 740 18 790 30',
	);
	const panelEdge = interpolate(frame, [114, 130], [118, -18], {
		...clamp,
		easing: Easing.bezier(0.83, 0, 0.17, 1),
	});

	return (
		<AbsoluteFill style={{backgroundColor: '#FF4A1C'}}>
			<AbsoluteFill
				style={{
					translate: `${(random(`shake-x-${frame}`) - 0.5) * 26 * shake}px ${(random(`shake-y-${frame}`) - 0.5) * 26 * shake}px`,
				}}
			>
				<div
					style={{
						position: 'absolute',
						left: 140,
						top: 92,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'flex-start',
					}}
				>
					<Interactive.Div
						name="WORDS"
						style={{
							fontFamily: sans,
							fontWeight: 900,
							fontSize: 232,
							lineHeight: 0.84,
							letterSpacing: '-0.045em',
							color: '#0B0B0F',
							transformOrigin: '30% 50%',
							scale: interpolate(frame, [0, 10], [2.8, 1], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
								easing: Easing.bezier(0.16, 1, 0.3, 1),
								output: 'perceptual-scale',
							}),
							opacity: interpolate(frame, [0, 3], [0, 1], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							}),
							filter: `blur(${interpolate(frame, [0, 8], [18, 0], clamp)}px)`,
						}}
					>
						WORDS
					</Interactive.Div>
					<RiseText
						text="THAT"
						start={15}
						stagger={2}
						duration={14}
						style={wordStyle}
					/>
					<FlipText text="MOVE" start={30} hops={[75, 90, 105]} />
					<div style={{position: 'relative', marginTop: -8}}>
						<Interactive.Div
							name="people."
							style={{
								fontFamily: serif,
								fontStyle: 'italic',
								fontSize: 262,
								lineHeight: 0.92,
								color: '#F3EFE6',
								paddingRight: 30,
								clipPath: `inset(-20% ${(1 - peopleReveal) * 110}% -30% -10%)`,
								translate: interpolate(
									frame,
									[60, 76],
									['70px 0px', '0px 0px'],
									{
										extrapolateLeft: 'clamp',
										extrapolateRight: 'clamp',
										easing: Easing.bezier(0.16, 1, 0.3, 1),
									},
								),
							}}
						>
							people.
						</Interactive.Div>
						<svg
							width={800}
							height={70}
							viewBox="0 0 800 70"
							style={{position: 'absolute', left: 10, bottom: -34}}
						>
							<path
								d="M 12 40 C 180 8 420 70 600 30 C 680 12 740 18 790 30"
								fill="none"
								stroke={colors.ink}
								strokeWidth={12}
								strokeLinecap="round"
								strokeDasharray={underline.strokeDasharray}
								strokeDashoffset={underline.strokeDashoffset}
							/>
						</svg>
					</div>
				</div>
				<Interactive.Div
					name="Circular badge"
					style={{
						position: 'absolute',
						left: 1400,
						top: 110,
						scale: interpolate(frame, [18, 42], [0, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: Easing.spring({damping: 12}),
							output: 'perceptual-scale',
						}),
					}}
				>
					<CircularBadge />
				</Interactive.Div>
				<Interactive.Div
					name="Beat meter"
					style={{
						position: 'absolute',
						right: 140,
						bottom: 150,
						opacity: interpolate(frame, [24, 36], [0, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					}}
				>
					<BeatMeter />
				</Interactive.Div>
				<ChapterTag
					index="01"
					title="Kinetic type"
					color={colors.ink}
					start={8}
				/>
			</AbsoluteFill>
			<AbsoluteFill
				style={{
					backgroundColor: colors.ink,
					clipPath: `polygon(0% ${panelEdge - 9}%, 100% ${panelEdge + 9}%, 100% 130%, 0% 130%)`,
				}}
			>
				<MarqueeWall />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
