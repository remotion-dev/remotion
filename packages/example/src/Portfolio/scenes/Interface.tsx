import {Audio} from '@remotion/media';
import {evolvePath} from '@remotion/paths';
import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Interactive,
	interpolate,
	interpolateColors,
	random,
	useCurrentFrame,
} from 'remotion';
import {ChapterTag} from '../components/ChapterTag';
import {RiseText} from '../components/RiseText';
import {colors, mono, sans, serif} from '../theme';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const smooth = Easing.bezier(0.65, 0, 0.35, 1);
const outExpo = Easing.bezier(0.16, 1, 0.3, 1);

// Screen-space layout of the window, so the cursor can target its controls.
const WIN = {left: 800, top: 190, width: 980, height: 660};
const TOGGLE_CLICK = 84;
const PUBLISH_CLICK = 132;
const PUBLISH = {x: 1600, y: 270, width: 148, height: 48};
const TOGGLE = {x: 1672, y: 716};

const surface = '#16171D';
const line = 'rgba(255, 255, 255, 0.07)';
const textMuted = 'rgba(243, 239, 230, 0.5)';

const Toggle: React.FC<{readonly on: number}> = ({on}) => (
	<div
		style={{
			width: 52,
			height: 30,
			borderRadius: 15,
			backgroundColor: interpolateColors(
				on,
				[0, 1],
				['#2A2B33', colors.accent],
			),
			position: 'relative',
		}}
	>
		<div
			style={{
				position: 'absolute',
				top: 3,
				left: 3,
				width: 24,
				height: 24,
				borderRadius: 12,
				backgroundColor: colors.paper,
				translate: `${on * 22}px 0`,
				boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
			}}
		/>
	</div>
);

const StatCard: React.FC<{
	readonly left: number;
	readonly label: string;
	readonly value: string;
	readonly delta: string;
	readonly delay: number;
	readonly highlight?: number;
}> = ({left, label, value, delta, delay, highlight = 0}) => {
	const frame = useCurrentFrame();
	const enter = interpolate(frame, [26 + delay, 46 + delay], [0, 1], {
		...clamp,
		easing: outExpo,
	});

	return (
		<div
			style={{
				position: 'absolute',
				left,
				top: 160,
				width: 228,
				height: 120,
				borderRadius: 16,
				backgroundColor: '#1C1D24',
				border: `1px solid ${interpolateColors(highlight, [0, 1], [line, 'rgba(255, 74, 28, 0.6)'])}`,
				padding: '18px 20px',
				boxSizing: 'border-box',
				opacity: enter,
				translate: `0 ${(1 - enter) * 24}px`,
			}}
		>
			<div
				style={{
					fontFamily: mono,
					fontSize: 13,
					letterSpacing: '0.14em',
					color: textMuted,
				}}
			>
				{label}
			</div>
			<div
				style={{
					fontFamily: sans,
					fontWeight: 700,
					fontSize: 38,
					letterSpacing: '-0.02em',
					color: colors.paper,
					marginTop: 8,
					fontVariantNumeric: 'tabular-nums',
				}}
			>
				{value}
			</div>
			<div
				style={{
					position: 'absolute',
					right: 18,
					top: 16,
					fontFamily: mono,
					fontSize: 13,
					fontWeight: 700,
					color: colors.accent,
					backgroundColor: 'rgba(255, 74, 28, 0.12)',
					padding: '4px 8px',
					borderRadius: 8,
				}}
			>
				{delta}
			</div>
		</div>
	);
};

const PerformanceChart: React.FC<{readonly boost: number}> = ({boost}) => {
	const frame = useCurrentFrame();
	const points = [
		150,
		136,
		142,
		118,
		124,
		100,
		106,
		84,
		92,
		70,
		76,
		60 - boost * 40,
	];
	const width = 668;
	const step = width / (points.length - 1);
	let d = `M 0 ${points[0]}`;
	for (let i = 1; i < points.length; i++) {
		const x0 = (i - 1) * step;
		const x1 = i * step;
		d += ` C ${x0 + step / 2} ${points[i - 1]} ${x1 - step / 2} ${points[i]} ${x1} ${points[i]}`;
	}
	const draw = evolvePath(
		interpolate(frame, [48, 92], [0, 1], {...clamp, easing: smooth}),
		d,
	);
	const areaOpacity = interpolate(frame, [70, 100], [0, 1], clamp);

	return (
		<div
			style={{
				position: 'absolute',
				left: 232,
				top: 296,
				width: 716,
				height: 200,
				borderRadius: 16,
				backgroundColor: '#1C1D24',
				border: `1px solid ${line}`,
				opacity: interpolate(frame, [36, 50], [0, 1], clamp),
			}}
		>
			<div
				style={{
					position: 'absolute',
					left: 24,
					top: 18,
					fontFamily: sans,
					fontWeight: 600,
					fontSize: 18,
					color: colors.paper,
				}}
			>
				Performance
			</div>
			<div
				style={{
					position: 'absolute',
					right: 22,
					top: 18,
					display: 'flex',
					alignItems: 'center',
					gap: 8,
					fontFamily: mono,
					fontSize: 12,
					letterSpacing: '0.14em',
					color: colors.accent,
					opacity: interpolate(frame, [150, 158], [0, 1], clamp),
				}}
			>
				<span
					style={{
						width: 8,
						height: 8,
						borderRadius: 4,
						backgroundColor: colors.accent,
						opacity: 0.5 + 0.5 * Math.sin(frame / 4),
					}}
				/>
				LIVE
			</div>
			<svg
				width={668}
				height={180}
				viewBox="0 0 668 180"
				style={{position: 'absolute', left: 24, top: 14, overflow: 'visible'}}
			>
				<defs>
					<linearGradient id="perf-fill" x1="0" x2="0" y1="0" y2="1">
						<stop offset="0%" stopColor={colors.accent} stopOpacity={0.35} />
						<stop offset="100%" stopColor={colors.accent} stopOpacity={0} />
					</linearGradient>
				</defs>
				<path
					d={`${d} L ${width} 180 L 0 180 Z`}
					fill="url(#perf-fill)"
					opacity={areaOpacity}
				/>
				<path
					d={d}
					fill="none"
					stroke={colors.accent}
					strokeWidth={3.5}
					strokeLinecap="round"
					strokeDasharray={draw.strokeDasharray}
					strokeDashoffset={draw.strokeDashoffset}
				/>
			</svg>
		</div>
	);
};

const Sidebar: React.FC = () => {
	const frame = useCurrentFrame();
	const items = ['Home', 'Projects', 'Analytics', 'Library', 'Settings'];

	return (
		<div
			style={{
				position: 'absolute',
				left: 0,
				top: 52,
				width: 200,
				bottom: 0,
				backgroundColor: '#121318',
				borderRight: `1px solid ${line}`,
			}}
		>
			<div
				style={{
					position: 'absolute',
					left: 24,
					top: 24,
					display: 'flex',
					alignItems: 'center',
					gap: 12,
				}}
			>
				<div
					style={{
						width: 28,
						height: 28,
						borderRadius: 8,
						backgroundColor: colors.accent,
					}}
				/>
				<div
					style={{
						fontFamily: sans,
						fontWeight: 800,
						fontSize: 22,
						color: colors.paper,
						letterSpacing: '-0.02em',
					}}
				>
					reel
				</div>
			</div>
			{items.map((item, i) => {
				const enter = interpolate(frame, [20 + i * 3, 36 + i * 3], [0, 1], {
					...clamp,
					easing: outExpo,
				});
				const active = i === 0;
				return (
					<div
						key={item}
						style={{
							position: 'absolute',
							left: 12,
							right: 12,
							top: 84 + i * 48,
							height: 40,
							borderRadius: 10,
							display: 'flex',
							alignItems: 'center',
							gap: 12,
							paddingLeft: 14,
							backgroundColor: active
								? 'rgba(255, 74, 28, 0.14)'
								: 'transparent',
							opacity: enter,
							translate: `${(1 - enter) * -16}px 0`,
						}}
					>
						<div
							style={{
								width: 16,
								height: 16,
								borderRadius: 5,
								backgroundColor: active
									? colors.accent
									: 'rgba(243, 239, 230, 0.22)',
							}}
						/>
						<div
							style={{
								fontFamily: sans,
								fontWeight: 500,
								fontSize: 17,
								color: active ? colors.paper : textMuted,
							}}
						>
							{item}
						</div>
					</div>
				);
			})}
		</div>
	);
};

const PublishButton: React.FC = () => {
	const frame = useCurrentFrame();
	const hover = interpolate(frame, [118, 126], [0, 1], clamp);
	const press = interpolate(
		frame,
		[PUBLISH_CLICK, PUBLISH_CLICK + 3, PUBLISH_CLICK + 14],
		[0, 1, 0],
		{...clamp, easing: [Easing.out(Easing.quad), Easing.spring({damping: 10})]},
	);
	const done = interpolate(
		frame,
		[PUBLISH_CLICK + 4, PUBLISH_CLICK + 12],
		[0, 1],
		clamp,
	);
	const check = evolvePath(
		interpolate(frame, [PUBLISH_CLICK + 8, PUBLISH_CLICK + 20], [0, 1], {
			...clamp,
			easing: smooth,
		}),
		'M 2 9 L 7 14 L 16 4',
	);
	const shine = interpolate(
		frame,
		[PUBLISH_CLICK + 6, PUBLISH_CLICK + 26],
		[-120, 260],
		{
			...clamp,
			easing: smooth,
		},
	);

	return (
		<div
			style={{
				position: 'absolute',
				left: PUBLISH.x - WIN.left,
				top: PUBLISH.y - WIN.top,
				width: PUBLISH.width,
				height: PUBLISH.height,
				borderRadius: 12,
				overflow: 'hidden',
				backgroundColor: colors.accent,
				scale: 1 + hover * 0.04 - press * 0.08,
				boxShadow: `0 ${8 + hover * 10}px ${24 + hover * 20}px rgba(255, 74, 28, ${0.25 + hover * 0.25})`,
				opacity: interpolate(frame, [24, 36], [0, 1], clamp),
			}}
		>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					fontFamily: sans,
					fontWeight: 700,
					fontSize: 18,
					color: colors.ink,
					opacity: 1 - done,
					translate: `0 ${done * -14}px`,
				}}
			>
				Publish
			</div>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					gap: 8,
					fontFamily: sans,
					fontWeight: 700,
					fontSize: 18,
					color: colors.ink,
					opacity: done,
					translate: `0 ${(1 - done) * 14}px`,
				}}
			>
				<svg width={18} height={18} viewBox="0 0 18 18">
					<path
						d="M 2 9 L 7 14 L 16 4"
						fill="none"
						stroke={colors.ink}
						strokeWidth={2.6}
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeDasharray={check.strokeDasharray}
						strokeDashoffset={check.strokeDashoffset}
					/>
				</svg>
				Published
			</div>
			<div
				style={{
					position: 'absolute',
					top: -20,
					bottom: -20,
					width: 50,
					left: shine,
					rotate: '20deg',
					background:
						'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)',
				}}
			/>
		</div>
	);
};

const Cursor: React.FC = () => {
	const frame = useCurrentFrame();
	const x = interpolate(
		frame,
		[44, 80, 96, 126, 152, 196],
		[1880, TOGGLE.x + 28, TOGGLE.x + 28, PUBLISH.x + 76, PUBLISH.x + 76, 1540],
		{...clamp, easing: [smooth, Easing.linear, smooth, Easing.linear, smooth]},
	);
	const y = interpolate(
		frame,
		[44, 80, 96, 126, 152, 196],
		[1140, TOGGLE.y + 17, TOGGLE.y + 17, PUBLISH.y + 26, PUBLISH.y + 26, 600],
		{
			...clamp,
			easing: [
				Easing.bezier(0.2, 0.9, 0.3, 1),
				Easing.linear,
				Easing.bezier(0.5, 0, 0.2, 1),
				Easing.linear,
				smooth,
			],
		},
	);
	const press = Math.max(
		interpolate(
			frame,
			[TOGGLE_CLICK, TOGGLE_CLICK + 2, TOGGLE_CLICK + 8],
			[0, 1, 0],
			clamp,
		),
		interpolate(
			frame,
			[PUBLISH_CLICK, PUBLISH_CLICK + 2, PUBLISH_CLICK + 8],
			[0, 1, 0],
			clamp,
		),
	);

	return (
		<svg
			width={36}
			height={44}
			viewBox="0 0 36 44"
			style={{
				position: 'absolute',
				left: x,
				top: y,
				scale: 1 - press * 0.16,
				transformOrigin: '2px 2px',
				filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.45))',
				opacity: interpolate(frame, [40, 46], [0, 1], clamp),
			}}
		>
			<path
				d="M 2 2 L 2 34 L 10 26 L 16 40 L 22 37 L 16 24 L 28 24 Z"
				fill={colors.paper}
				stroke={colors.ink}
				strokeWidth={2.5}
				strokeLinejoin="round"
			/>
		</svg>
	);
};

const ClickRipple: React.FC<{
	readonly x: number;
	readonly y: number;
	readonly at: number;
}> = ({x, y, at}) => {
	const frame = useCurrentFrame();
	const progress = interpolate(frame, [at, at + 18], [0, 1], {
		...clamp,
		easing: outExpo,
	});
	if (frame < at || progress >= 1) {
		return null;
	}

	return (
		<div
			style={{
				position: 'absolute',
				left: x - 60,
				top: y - 60,
				width: 120,
				height: 120,
				borderRadius: 60,
				border: `3px solid ${colors.paper}`,
				boxSizing: 'border-box',
				scale: progress,
				opacity: 1 - progress,
			}}
		/>
	);
};

const Burst: React.FC<{
	readonly x: number;
	readonly y: number;
	readonly at: number;
}> = ({x, y, at}) => {
	const frame = useCurrentFrame();
	if (frame < at || frame > at + 30) {
		return null;
	}

	return (
		<>
			{new Array(16).fill(true).map((_, i) => {
				const angle = (i / 16) * Math.PI * 2 + random(`burst-a-${i}`) * 0.4;
				const distance = 70 + random(`burst-d-${i}`) * 70;
				const progress = interpolate(frame, [at, at + 24], [0, 1], {
					...clamp,
					easing: outExpo,
				});
				const size = 6 + random(`burst-s-${i}`) * 8;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: x + Math.cos(angle) * distance * progress - size / 2,
							top: y + Math.sin(angle) * distance * progress - size / 2,
							width: size,
							height: size,
							borderRadius: i % 3 === 0 ? 2 : size / 2,
							backgroundColor: i % 2 === 0 ? colors.accent : colors.paper,
							opacity: interpolate(frame, [at + 10, at + 28], [1, 0], clamp),
							scale: 1 - progress * 0.5,
						}}
					/>
				);
			})}
		</>
	);
};

const Toast: React.FC = () => {
	const frame = useCurrentFrame();
	const enter = interpolate(frame, [146, 166], [0, 1], {
		...clamp,
		easing: Easing.spring({damping: 14}),
	});

	return (
		<div
			style={{
				position: 'absolute',
				left: 1330,
				top: 796,
				width: 430,
				height: 92,
				borderRadius: 18,
				backgroundColor: '#1F2028',
				border: '1px solid rgba(255,255,255,0.1)',
				boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
				overflow: 'hidden',
				opacity: interpolate(frame, [146, 152], [0, 1], clamp),
				translate: `0 ${(1 - enter) * 70}px`,
			}}
		>
			<div
				style={{
					position: 'absolute',
					left: 22,
					top: 22,
					width: 48,
					height: 48,
					borderRadius: 24,
					backgroundColor: colors.accent,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<svg width={22} height={22} viewBox="0 0 18 18">
					<path
						d="M 2 9 L 7 14 L 16 4"
						fill="none"
						stroke={colors.ink}
						strokeWidth={2.8}
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</div>
			<div
				style={{
					position: 'absolute',
					left: 88,
					top: 20,
					fontFamily: sans,
					fontWeight: 700,
					fontSize: 22,
					color: colors.paper,
				}}
			>
				Reel published
			</div>
			<div
				style={{
					position: 'absolute',
					left: 88,
					top: 52,
					fontFamily: mono,
					fontSize: 15,
					color: textMuted,
				}}
			>
				1,204 followers notified
			</div>
			<div
				style={{
					position: 'absolute',
					left: 0,
					bottom: 0,
					height: 4,
					width: '100%',
					backgroundColor: colors.accent,
					scale: `${interpolate(frame, [166, 252], [1, 0], clamp)} 1`,
					transformOrigin: '0% 50%',
				}}
			/>
		</div>
	);
};

const AppWindow: React.FC = () => {
	const frame = useCurrentFrame();
	const settle = interpolate(frame, [0, 46], [0, 1], {
		...clamp,
		easing: Easing.bezier(0.22, 1, 0.36, 1),
	});
	const autoPublish = interpolate(
		frame,
		[TOGGLE_CLICK + 2, TOGGLE_CLICK + 12],
		[0, 1],
		{
			...clamp,
			easing: Easing.spring({damping: 12}),
		},
	);
	const boost = interpolate(
		frame,
		[PUBLISH_CLICK + 20, PUBLISH_CLICK + 60],
		[0, 1],
		{
			...clamp,
			easing: outExpo,
		},
	);
	const views = Math.round(12408 + boost * 2574).toLocaleString('en-US');

	return (
		<div
			style={{
				position: 'absolute',
				left: WIN.left,
				top: WIN.top,
				width: WIN.width,
				height: WIN.height,
				borderRadius: 22,
				backgroundColor: surface,
				border: '1px solid rgba(255,255,255,0.09)',
				boxShadow: '0 80px 140px rgba(0,0,0,0.6)',
				overflow: 'hidden',
				transformOrigin: '0% 50%',
				transform: `perspective(2400px) translateY(${(1 - settle) * 90}px) rotateY(${(1 - settle) * -30}deg) rotateX(${(1 - settle) * 14}deg) scale(${0.9 + settle * 0.1})`,
				opacity: interpolate(frame, [0, 12], [0, 1], clamp),
			}}
		>
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: 0,
					height: 52,
					borderBottom: `1px solid ${line}`,
					display: 'flex',
					alignItems: 'center',
					gap: 9,
					paddingLeft: 20,
				}}
			>
				{['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
					<div
						key={c}
						style={{
							width: 13,
							height: 13,
							borderRadius: 7,
							backgroundColor: c,
							opacity: 0.85,
						}}
					/>
				))}
				<div
					style={{
						position: 'absolute',
						left: 0,
						right: 0,
						textAlign: 'center',
						fontFamily: mono,
						fontSize: 14,
						letterSpacing: '0.08em',
						color: textMuted,
					}}
				>
					reel.app — dashboard
				</div>
			</div>
			<Sidebar />
			<div
				style={{
					position: 'absolute',
					left: 232,
					top: 82,
					fontFamily: sans,
					fontWeight: 700,
					fontSize: 30,
					letterSpacing: '-0.02em',
					color: colors.paper,
					opacity: interpolate(frame, [18, 32], [0, 1], clamp),
				}}
			>
				Good evening, Alex
			</div>
			<div
				style={{
					position: 'absolute',
					left: 232,
					top: 124,
					fontFamily: mono,
					fontSize: 14,
					letterSpacing: '0.06em',
					color: textMuted,
					opacity: interpolate(frame, [22, 36], [0, 1], clamp),
				}}
			>
				{frame >= PUBLISH_CLICK + 6
					? '2 drafts · 1 live now'
					: '3 drafts · 1 scheduled'}
			</div>
			<PublishButton />
			<StatCard
				left={232}
				label="VIEWS"
				value={views}
				delta={boost > 0.05 ? '+21%' : '+8%'}
				delay={0}
				highlight={boost * (1 - interpolate(frame, [200, 240], [0, 1], clamp))}
			/>
			<StatCard
				left={476}
				label="WATCH TIME"
				value="3.2k h"
				delta="+12%"
				delay={4}
			/>
			<StatCard
				left={720}
				label="FOLLOWERS"
				value="8,921"
				delta="+4%"
				delay={8}
			/>
			<PerformanceChart boost={boost} />
			<div
				style={{
					position: 'absolute',
					left: 232,
					top: 512,
					width: 716,
					height: 116,
					borderRadius: 16,
					backgroundColor: '#1C1D24',
					border: `1px solid ${line}`,
					opacity: interpolate(frame, [42, 56], [0, 1], clamp),
				}}
			>
				{[
					{label: 'Auto-publish to socials', on: autoPublish},
					{label: 'Notify followers', on: 1},
				].map((row, i) => (
					<div
						key={row.label}
						style={{
							position: 'absolute',
							left: 24,
							right: 24,
							top: i * 58,
							height: 58,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							borderTop: i === 0 ? 'none' : `1px solid ${line}`,
						}}
					>
						<div
							style={{
								fontFamily: sans,
								fontWeight: 500,
								fontSize: 18,
								color: colors.paper,
							}}
						>
							{row.label}
						</div>
						<Toggle on={row.on} />
					</div>
				))}
			</div>
		</div>
	);
};

export const Interface: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#0E0F13',
				backgroundImage:
					'radial-gradient(circle at 70% 48%, rgba(255, 74, 28, 0.22), transparent 42%), radial-gradient(circle at 12% 92%, rgba(96, 110, 255, 0.12), transparent 40%)',
			}}
		>
			<div
				style={{
					position: 'absolute',
					left: 140,
					top: 196,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'flex-start',
				}}
			>
				<RiseText
					text="Interfaces"
					start={12}
					stagger={2}
					style={{
						fontFamily: sans,
						fontWeight: 800,
						fontSize: 106,
						lineHeight: 0.84,
						letterSpacing: '-0.045em',
						color: colors.paper,
						paddingTop: 8,
					}}
				/>
				<RiseText
					text="that feel"
					start={18}
					stagger={2}
					style={{
						fontFamily: sans,
						fontWeight: 800,
						fontSize: 106,
						lineHeight: 0.84,
						letterSpacing: '-0.045em',
						color: colors.paper,
						paddingTop: 8,
					}}
				/>
				<RiseText
					text="alive."
					start={24}
					stagger={3}
					style={{
						fontFamily: serif,
						fontStyle: 'italic',
						fontSize: 124,
						lineHeight: 0.9,
						color: colors.accent,
						paddingRight: 16,
					}}
				/>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						gap: 20,
						marginTop: 70,
					}}
				>
					{[
						'Micro-interactions',
						'State transitions',
						'Cursor choreography',
					].map((label, i) => {
						const enter = interpolate(frame, [40 + i * 6, 58 + i * 6], [0, 1], {
							...clamp,
							easing: outExpo,
						});
						return (
							<div
								key={label}
								style={{
									display: 'flex',
									gap: 18,
									fontFamily: mono,
									fontSize: 28,
									letterSpacing: '0.02em',
									color: colors.paper,
									opacity: enter * 0.8,
									translate: `${(1 - enter) * -24}px 0`,
								}}
							>
								<span style={{color: colors.accent}}>→</span>
								{label}
							</div>
						);
					})}
				</div>
			</div>
			<Interactive.Div
				name="Product float"
				style={{
					position: 'absolute',
					inset: 0,
					translate: `0px ${Math.sin(frame / 22) * 4}px`,
				}}
			>
				<AppWindow />
				<ClickRipple x={TOGGLE.x + 28} y={TOGGLE.y + 17} at={TOGGLE_CLICK} />
				<ClickRipple x={PUBLISH.x + 76} y={PUBLISH.y + 26} at={PUBLISH_CLICK} />
				<Burst
					x={PUBLISH.x + PUBLISH.width / 2}
					y={PUBLISH.y + PUBLISH.height / 2}
					at={PUBLISH_CLICK + 2}
				/>
				<Toast />
				<Cursor />
			</Interactive.Div>
			<ChapterTag
				index="04"
				title="Interface"
				color={colors.paper}
				start={16}
			/>
			<Audio
				name="Toggle click"
				src="https://remotion.media/portfolio-reel/v1/sfx/mouse-click.wav"
				from={TOGGLE_CLICK}
				volume={0.8}
			/>
			<Audio
				name="Toggle switch"
				src="https://remotion.media/portfolio-reel/v1/sfx/switch.wav"
				from={TOGGLE_CLICK + 2}
				volume={0.5}
			/>
			<Audio
				name="Publish click"
				src="https://remotion.media/portfolio-reel/v1/sfx/mouse-click.wav"
				from={PUBLISH_CLICK}
				volume={0.8}
			/>
			<Audio
				name="Toast ding"
				src="https://remotion.media/portfolio-reel/v1/sfx/ding.wav"
				from={148}
				volume={0.22}
			/>
		</AbsoluteFill>
	);
};
