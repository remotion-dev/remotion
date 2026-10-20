import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {exit, pop, rise} from '../anim';
import {display, mono} from '../fonts';
import {colors} from '../theme';

// Pops its children in at `delay` and fades them out at the end of the
// surrounding sequence.
export const Pop: React.FC<{
	readonly delay?: number;
	readonly rotate?: number;
	readonly from?: 'scale' | 'up' | 'left' | 'right';
	readonly exitDuration?: number;
	readonly style?: React.CSSProperties;
	readonly children: React.ReactNode;
}> = ({
	delay = 0,
	rotate = 0,
	from = 'scale',
	exitDuration = 9,
	style,
	children,
}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const p = pop(frame, delay);
	const out = exit(frame, durationInFrames, exitDuration);
	const offset = (1 - p) * 60;
	const translate =
		from === 'up'
			? `0px ${offset}px`
			: from === 'left'
				? `${-offset}px 0px`
				: from === 'right'
					? `${offset}px 0px`
					: '0px 0px';
	return (
		<div
			style={{
				opacity: Math.min(1, p * 1.6) * out,
				scale: (from === 'scale' ? 0.55 + 0.45 * p : 1) * (0.92 + 0.08 * out),
				rotate: `${rotate * (2 - p)}deg`,
				translate,
				...style,
			}}
		>
			{children}
		</div>
	);
};

// The free area to the left of the talking head in the split layout.
export const Panel: React.FC<{
	readonly children: React.ReactNode;
	readonly style?: React.CSSProperties;
}> = ({children, style}) => (
	<div
		style={{
			position: 'absolute',
			left: 80,
			top: 70,
			width: 840,
			height: 940,
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
			alignItems: 'center',
			gap: 30,
			...style,
		}}
	>
		{children}
	</div>
);

export const ChapterSticker: React.FC<{
	readonly index: React.ReactNode;
	readonly title: string;
	readonly accent: string;
	readonly accentText?: string;
	readonly overline?: string;
	readonly style?: React.CSSProperties;
}> = ({
	index,
	title,
	accent,
	accentText = colors.paper,
	overline = "What's new",
	style,
}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const p = pop(frame, 0, 11);
	const out = exit(frame, durationInFrames, 10);
	const underline = rise(frame, 8, 16);

	return (
		<div
			style={{
				position: 'absolute',
				left: 72,
				top: 340,
				transformOrigin: '0% 50%',
				opacity: Math.min(1, p * 2) * out,
				scale: (0.4 + 0.6 * p) * (0.9 + 0.1 * out),
				rotate: `${-3 - 6 * (1 - p)}deg`,
				translate: `0px ${(1 - out) * -30}px`,
				...style,
			}}
		>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 28,
					padding: '24px 46px 26px 24px',
					backgroundColor: colors.paper,
					borderRadius: 36,
					boxShadow:
						'0 28px 70px rgba(10, 16, 32, 0.34), 0 4px 12px rgba(10,16,32,0.18)',
				}}
			>
				<div
					style={{
						width: 104,
						height: 104,
						borderRadius: 26,
						flexShrink: 0,
						backgroundColor: accent,
						color: accentText,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontFamily: display,
						fontWeight: 700,
						fontSize: 50,
						letterSpacing: '-0.02em',
					}}
				>
					{index}
				</div>
				<div style={{display: 'flex', flexDirection: 'column', gap: 2}}>
					<div
						style={{
							fontFamily: display,
							fontWeight: 500,
							fontSize: 26,
							letterSpacing: '0.16em',
							textTransform: 'uppercase',
							color: colors.muted,
						}}
					>
						{overline}
					</div>
					<div
						style={{
							fontFamily: display,
							fontWeight: 700,
							fontSize: 72,
							lineHeight: 1,
							letterSpacing: '-0.03em',
							color: colors.ink,
							position: 'relative',
							maxWidth: 560,
							textWrap: 'balance',
						}}
					>
						{title}
						<div
							style={{
								position: 'absolute',
								left: 0,
								bottom: -12,
								height: 8,
								borderRadius: 4,
								width: `${underline * 100}%`,
								backgroundColor: accent,
							}}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export type Tok = readonly [string, string?];

export const syntax = {
	plain: '#E6EDF3',
	keyword: '#FF7AC6',
	fn: '#7CC4FF',
	string: '#A6E3A1',
	number: '#FAB387',
	punct: '#8B95A7',
	tag: '#7CC4FF',
	attr: '#F9E2AF',
	comment: '#6C7892',
	prompt: '#34D399',
};

// Renders syntax-colored lines, revealing characters like a typewriter.
export const CodeLines: React.FC<{
	readonly lines: readonly (readonly Tok[])[];
	readonly start?: number;
	readonly speed?: number;
	readonly cursor?: boolean;
	readonly highlightLine?: number;
	readonly highlightFrom?: number;
}> = ({
	lines,
	start = 0,
	speed = 1.4,
	cursor = true,
	highlightLine,
	highlightFrom = 0,
}) => {
	const frame = useCurrentFrame();
	let budget = Math.max(0, Math.floor((frame - start) * speed));
	const total = lines.reduce(
		(acc, line) => acc + line.reduce((a, [t]) => a + t.length, 0) + 1,
		0,
	);
	const done = budget >= total;
	const highlight = rise(frame, highlightFrom, 12);

	return (
		<div>
			{lines.map((line, li) => {
				const lineLength = line.reduce((a, [t]) => a + t.length, 0);
				const visibleChars = Math.min(lineLength, budget);
				const showCursor =
					cursor && !done && budget >= 0 && budget <= lineLength;
				budget -= lineLength + 1;
				let remaining = visibleChars;
				const isHighlighted = highlightLine === li;
				return (
					<div
						key={li}
						style={{
							minHeight: '1.55em',
							whiteSpace: 'pre',
							margin: '0 -32px',
							padding: '0 32px',
							backgroundColor: isHighlighted
								? `rgba(11,132,243,${0.28 * highlight})`
								: 'transparent',
							boxShadow: isHighlighted
								? `inset 5px 0 0 rgba(11,132,243,${highlight})`
								: 'none',
						}}
					>
						{line.map(([text, color], ti) => {
							const shown = text.slice(0, Math.max(0, remaining));
							remaining -= text.length;
							return (
								<span key={ti} style={{color: color ?? syntax.plain}}>
									{shown}
								</span>
							);
						})}
						{showCursor ? (
							<span
								style={{
									display: 'inline-block',
									width: '0.55em',
									height: '1.1em',
									translate: '0 0.18em',
									backgroundColor: colors.blue,
									opacity: Math.floor(frame / 8) % 2 === 0 ? 1 : 0.35,
								}}
							/>
						) : null}
					</div>
				);
			})}
		</div>
	);
};

export const Window: React.FC<{
	readonly title?: string;
	readonly width?: number;
	readonly fontSize?: number;
	readonly light?: boolean;
	readonly style?: React.CSSProperties;
	readonly children: React.ReactNode;
}> = ({title, width = 820, fontSize = 29, light = false, style, children}) => (
	<div
		style={{
			width,
			borderRadius: 26,
			overflow: 'hidden',
			backgroundColor: light ? colors.paper : colors.code,
			boxShadow:
				'0 30px 80px rgba(10, 16, 32, 0.35), 0 0 0 1px rgba(255,255,255,0.06)',
			...style,
		}}
	>
		<div
			style={{
				height: 58,
				display: 'flex',
				alignItems: 'center',
				padding: '0 22px',
				gap: 10,
				backgroundColor: light ? '#F4F6FA' : '#151B2B',
				borderBottom: light ? `1px solid ${colors.line}` : '1px solid #222B40',
				position: 'relative',
			}}
		>
			{['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
				<div
					key={c}
					style={{width: 15, height: 15, borderRadius: 8, backgroundColor: c}}
				/>
			))}
			{title ? (
				<div
					style={{
						position: 'absolute',
						left: 0,
						right: 0,
						textAlign: 'center',
						fontFamily: mono,
						fontSize: 21,
						color: light ? colors.muted : '#8B95A7',
					}}
				>
					{title}
				</div>
			) : null}
		</div>
		<div
			style={{
				padding: '26px 32px 30px',
				fontFamily: mono,
				fontSize,
				lineHeight: 1.55,
				color: light ? colors.ink : syntax.plain,
			}}
		>
			{children}
		</div>
	</div>
);

export const Chip: React.FC<{
	readonly children: React.ReactNode;
	readonly color?: string;
	readonly background?: string;
	readonly icon?: React.ReactNode;
	readonly fontSize?: number;
	readonly style?: React.CSSProperties;
}> = ({
	children,
	color = colors.ink,
	background = colors.paper,
	icon,
	fontSize = 34,
	style,
}) => (
	<div
		style={{
			display: 'inline-flex',
			alignItems: 'center',
			gap: 14,
			padding: '14px 28px 16px',
			borderRadius: 999,
			backgroundColor: background,
			color,
			fontFamily: display,
			fontWeight: 700,
			fontSize,
			letterSpacing: '-0.01em',
			boxShadow: '0 14px 34px rgba(10, 16, 32, 0.16)',
			whiteSpace: 'nowrap',
			...style,
		}}
	>
		{icon}
		{children}
	</div>
);

// A rubber stamp that slams in from large to its resting size.
export const Stamp: React.FC<{
	readonly children: React.ReactNode;
	readonly color: string;
	readonly rotate?: number;
	readonly fontSize?: number;
	readonly delay?: number;
	readonly style?: React.CSSProperties;
}> = ({children, color, rotate = -8, fontSize = 60, delay = 0, style}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const slam = interpolate(frame - delay, [0, 7], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const settle = pop(frame, delay + 5, 9);
	const out = exit(frame, durationInFrames, 8);
	return (
		<div
			style={{
				display: 'inline-block',
				padding: '10px 30px 14px',
				border: `7px solid ${color}`,
				borderRadius: 22,
				color,
				backgroundColor: 'rgba(255,255,255,0.92)',
				fontFamily: display,
				fontWeight: 700,
				fontSize,
				letterSpacing: '0.02em',
				textTransform: 'uppercase',
				whiteSpace: 'nowrap',
				opacity: slam * out,
				rotate: `${rotate}deg`,
				scale:
					interpolate(slam, [0, 1], [2.4, 1]) *
					(1 + 0.04 * Math.sin(settle * Math.PI)),
				boxShadow: '0 18px 40px rgba(10,16,32,0.18)',
				...style,
			}}
		>
			{children}
		</div>
	);
};

export const CheckBadge: React.FC<{
	readonly delay?: number;
	readonly size?: number;
	readonly color?: string;
}> = ({delay = 0, size = 64, color = colors.success}) => {
	const frame = useCurrentFrame();
	const p = pop(frame, delay, 10);
	const draw = rise(frame, delay + 3, 12);
	return (
		<div
			style={{
				width: size,
				height: size,
				borderRadius: size / 2,
				backgroundColor: color,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				scale: p,
				flexShrink: 0,
				boxShadow: `0 10px 24px ${color}66`,
			}}
		>
			<svg
				width={size * 0.6}
				height={size * 0.6}
				viewBox="0 0 24 24"
				fill="none"
			>
				<path
					d="M4.5 12.5l5 5 10-11"
					stroke="#fff"
					strokeWidth={3.2}
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeDasharray={24}
					strokeDashoffset={24 * (1 - draw)}
				/>
			</svg>
		</div>
	);
};

export const Label: React.FC<{
	readonly children: React.ReactNode;
	readonly color?: string;
	readonly style?: React.CSSProperties;
}> = ({children, color = colors.muted, style}) => (
	<div
		style={{
			fontFamily: display,
			fontWeight: 500,
			fontSize: 26,
			letterSpacing: '0.14em',
			textTransform: 'uppercase',
			color,
			...style,
		}}
	>
		{children}
	</div>
);
