import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {easeInOut, pop, rise} from '../anim';
import {display, mono} from '../fonts';
import {colors} from '../theme';
import {CursorIcon} from './icons';
import {syntax} from './ui';

// Frames are relative to the start of the mock's sequence.
const T = {
	toggle: 34,
	select: 100,
	dragStart: 150,
	dragEnd: 205,
	scaleStart: 220,
	scaleEnd: 246,
	rotateStart: 252,
	rotateEnd: 272,
	color: 280,
	saved: 300,
};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Vertical positions of the inspector rows, in mock coordinates.
const ROW_Y = [214, 260, 306, 352, 398];

const CANVAS_W = 800;
const CANVAS_H = 450;
const CANVAS_X = 50;
const CANVAS_Y = 81;
const TO_COMPOSITION = 1920 / CANVAS_W;

const Changed: React.FC<{
	readonly at: number;
	readonly children: React.ReactNode;
}> = ({at, children}) => {
	const frame = useCurrentFrame();
	const glow = interpolate(frame, [at, at + 4, at + 40], [0, 1, 0], clamp);
	return (
		<span
			style={{
				backgroundColor: `rgba(255, 211, 77, ${0.35 * glow})`,
				borderRadius: 6,
				boxShadow: `0 0 0 4px rgba(255, 211, 77, ${0.35 * glow})`,
			}}
		>
			{children}
		</span>
	);
};

export const StudioMock: React.FC = () => {
	const frame = useCurrentFrame();

	const drag = interpolate(frame, [T.dragStart, T.dragEnd], [0, 1], {
		...clamp,
		easing: easeInOut,
	});
	const offsetX = 154 * drag;
	const offsetY = 51 * drag;
	const scale = interpolate(frame, [T.scaleStart, T.scaleEnd], [1, 1.2], {
		...clamp,
		easing: easeInOut,
	});
	const rotate = interpolate(frame, [T.rotateStart, T.rotateEnd], [0, -4], {
		...clamp,
		easing: easeInOut,
	});
	const recolored = frame >= T.color;
	const selected = frame >= T.select;
	const visualMode = frame >= T.toggle;
	const saved = rise(frame, T.saved, 10);

	const titleX = CANVAS_X + CANVAS_W / 2 + offsetX;
	const titleY = CANVAS_Y + CANVAS_H / 2 + offsetY;

	// Cursor path in mock coordinates. While dragging it sticks to what it drags.
	const waypoints: [number, number, number][] = [
		[60, 1180, 720],
		[96, 450, 306],
		[T.dragStart, 450, 306],
		[T.dragEnd, 604, 357],
		[T.scaleStart, 808, 413],
		[T.scaleEnd, 849, 424],
		[T.rotateStart, 1330, ROW_Y[2] + 14],
		[T.rotateEnd, 1290, ROW_Y[2] + 14],
		[T.color - 2, 1352, ROW_Y[4] + 14],
		[T.color + 4, 1352, ROW_Y[4] + 14],
		[330, 1360, 640],
	];
	const along = (index: 1 | 2) =>
		interpolate(
			frame,
			waypoints.map((w) => w[0]),
			waypoints.map((w) => w[index]),
			{...clamp, easing: easeInOut},
		);
	const dragging = frame >= T.dragStart && frame <= T.dragEnd;
	const scaling = frame >= T.scaleStart && frame <= T.scaleEnd;
	const cursorX = dragging ? titleX : scaling ? titleX + 204 * scale : along(1);
	const cursorY = dragging ? titleY : scaling ? titleY + 56 * scale : along(2);
	const cursorOpacity = interpolate(
		frame,
		[56, 64, 324, 336],
		[0, 1, 1, 0],
		clamp,
	);
	const pressed =
		(frame >= T.select - 3 && frame <= T.select + 2) ||
		(frame >= T.dragStart && frame <= T.dragEnd) ||
		(frame >= T.scaleStart && frame <= T.scaleEnd) ||
		(frame >= T.rotateStart && frame <= T.rotateEnd) ||
		(frame >= T.color - 2 && frame <= T.color + 2);

	const translateValue = `"${Math.round(offsetX * TO_COMPOSITION)}px ${Math.round(offsetY * TO_COMPOSITION)}px"`;
	const titleColor = recolored ? '#FFD34D' : '#FFFFFF';

	const inspectorRows: {label: string; value: string; at: number}[] = [
		{
			label: 'Offset',
			value: `${Math.round(offsetX * TO_COMPOSITION)}px  ${Math.round(offsetY * TO_COMPOSITION)}px`,
			at: T.dragStart,
		},
		{label: 'Scale', value: scale.toFixed(2), at: T.scaleStart},
		{label: 'Rotation', value: `${rotate.toFixed(0)}°`, at: T.rotateStart},
		{label: 'Opacity', value: '1.00', at: 99999},
	];

	return (
		<div
			style={{
				width: 1400,
				height: 840,
				borderRadius: 30,
				overflow: 'hidden',
				backgroundColor: '#16181D',
				boxShadow:
					'0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)',
				position: 'relative',
				fontFamily: display,
			}}
		>
			{/* Title bar */}
			<div
				style={{
					height: 56,
					display: 'flex',
					alignItems: 'center',
					padding: '0 22px',
					gap: 10,
					backgroundColor: '#1F2126',
					borderBottom: '1px solid #2C2F36',
				}}
			>
				{['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
					<div
						key={c}
						style={{width: 14, height: 14, borderRadius: 7, backgroundColor: c}}
					/>
				))}
				<div
					style={{
						marginLeft: 18,
						color: '#C9CDD4',
						fontSize: 22,
						fontWeight: 500,
					}}
				>
					Remotion Studio
				</div>
				<div style={{flex: 1}} />
				<div
					style={{
						color: visualMode ? colors.paper : '#8A8F98',
						fontSize: 22,
						fontWeight: 700,
					}}
				>
					Visual mode
				</div>
				<div
					style={{
						width: 58,
						height: 32,
						borderRadius: 16,
						backgroundColor: visualMode ? colors.blue : '#3A3E46',
						position: 'relative',
					}}
				>
					<div
						style={{
							position: 'absolute',
							top: 4,
							left: visualMode ? 30 : 4,
							width: 24,
							height: 24,
							borderRadius: 12,
							backgroundColor: colors.paper,
						}}
					/>
				</div>
			</div>

			{/* Canvas area */}
			<div
				style={{
					position: 'absolute',
					left: 0,
					top: 56,
					width: 900,
					height: 500,
					backgroundColor: '#111317',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left: CANVAS_X,
					top: CANVAS_Y,
					width: CANVAS_W,
					height: CANVAS_H,
					overflow: 'hidden',
					background: 'linear-gradient(135deg, #0B84F3 0%, #5B3CFF 100%)',
					boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
				}}
			>
				<div
					style={{
						position: 'absolute',
						left: CANVAS_W / 2 + offsetX,
						top: CANVAS_H / 2 + offsetY,
						translate: '-50% -50%',
						scale,
						rotate: `${rotate}deg`,
						fontWeight: 700,
						fontSize: 76,
						letterSpacing: '-0.03em',
						color: titleColor,
						whiteSpace: 'nowrap',
						outline: selected ? `3px solid ${colors.paper}` : 'none',
						outlineOffset: 14,
					}}
				>
					Launch day
					{selected ? (
						<>
							{/* Corner handles sit on the outline, which is offset by 14px. */}
							{[
								[0, 0],
								[100, 0],
								[0, 100],
								[100, 100],
							].map(([x, y]) => (
								<div
									key={`${x}-${y}`}
									style={{
										position: 'absolute',
										left: `calc(${x}% ${x === 0 ? '-' : '+'} 14px - 9px)`,
										top: `calc(${y}% ${y === 0 ? '-' : '+'} 14px - 9px)`,
										width: 14,
										height: 14,
										backgroundColor: colors.paper,
										border: `3px solid ${colors.blue}`,
										borderRadius: 3,
									}}
								/>
							))}
						</>
					) : null}
				</div>
			</div>

			{/* Inspector */}
			<div
				style={{
					position: 'absolute',
					left: 900,
					top: 56,
					width: 500,
					height: 500,
					backgroundColor: '#1F2126',
					borderLeft: '1px solid #2C2F36',
					padding: '22px 30px',
					boxSizing: 'border-box',
				}}
			>
				<div
					style={{
						display: 'flex',
						gap: 26,
						borderBottom: '1px solid #2C2F36',
						paddingBottom: 14,
					}}
				>
					<div
						style={{
							color: colors.paper,
							fontSize: 24,
							fontWeight: 700,
							borderBottom: `3px solid ${colors.blue}`,
							paddingBottom: 10,
						}}
					>
						Inspector
					</div>
					<div style={{color: '#8A8F98', fontSize: 24, fontWeight: 500}}>
						Renders
					</div>
				</div>
				<div
					style={{
						marginTop: 18,
						fontFamily: mono,
						fontSize: 22,
						color: selected ? colors.paper : '#6B7280',
					}}
				>
					{selected ? '<Title>  MyVideo.tsx:14' : 'Nothing selected'}
				</div>
			</div>
			{[...inspectorRows, {label: 'Color', value: '', at: T.color}].map(
				(row, i) => (
					<div
						key={row.label}
						style={{
							position: 'absolute',
							left: 930,
							width: 440,
							top: ROW_Y[i],
							height: 30,
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							fontSize: 24,
							opacity: selected ? 1 : 0.3,
						}}
					>
						<span style={{color: '#C9CDD4', fontWeight: 500}}>
							◆ {row.label}
						</span>
						{row.label === 'Color' ? (
							<span
								style={{
									width: 40,
									height: 28,
									borderRadius: 6,
									backgroundColor: titleColor,
									boxShadow: '0 0 0 2px #3A3E46',
								}}
							/>
						) : (
							<span style={{color: '#4DA3FF', fontFamily: mono}}>
								<Changed at={row.at}>{row.value}</Changed>
							</span>
						)}
					</div>
				),
			)}

			{/* Code */}
			<div
				style={{
					position: 'absolute',
					left: 0,
					top: 556,
					width: 1400,
					height: 284,
					backgroundColor: colors.code,
					borderTop: '1px solid #2C2F36',
					padding: '16px 30px',
					boxSizing: 'border-box',
					fontFamily: mono,
					fontSize: 23,
					lineHeight: 1.36,
					color: syntax.plain,
				}}
			>
				<div style={{color: '#6C7892', fontSize: 19, marginBottom: 4}}>
					MyVideo.tsx
				</div>
				<div>
					<span style={{color: syntax.punct}}>{'<'}</span>
					<span style={{color: syntax.tag}}>Title</span>
				</div>
				<div>
					<span style={{color: syntax.attr}}>{'  style'}</span>
					<span style={{color: syntax.punct}}>{'={{'}</span>
				</div>
				<div>
					{'    translate: '}
					<Changed at={T.dragStart}>
						<span style={{color: syntax.string}}>{translateValue}</span>
					</Changed>
					<span style={{color: syntax.punct}}>,</span>
				</div>
				<div>
					{'    scale: '}
					<Changed at={T.scaleStart}>
						<span style={{color: syntax.number}}>{scale.toFixed(2)}</span>
					</Changed>
					<span style={{color: syntax.punct}}>,</span>
				</div>
				<div>
					{'    rotate: '}
					<Changed at={T.rotateStart}>
						<span
							style={{color: syntax.string}}
						>{`"${rotate.toFixed(0)}deg"`}</span>
					</Changed>
					<span style={{color: syntax.punct}}>,</span>
				</div>
				<div>
					{'    color: '}
					<Changed at={T.color}>
						<span style={{color: syntax.string}}>{`"${titleColor}"`}</span>
					</Changed>
					<span style={{color: syntax.punct}}>,</span>
				</div>
				<div style={{color: syntax.punct}}>{'  }}>Launch day</Title>'}</div>
				<div
					style={{
						position: 'absolute',
						right: 30,
						bottom: 24,
						display: 'flex',
						alignItems: 'center',
						gap: 12,
						padding: '12px 20px',
						borderRadius: 14,
						backgroundColor: colors.success,
						color: colors.paper,
						fontFamily: display,
						fontWeight: 700,
						fontSize: 26,
						opacity: saved,
						translate: `0px ${(1 - saved) * 16}px`,
						scale: 0.9 + 0.1 * pop(frame, T.saved, 10),
					}}
				>
					✓ Written back to MyVideo.tsx
				</div>
			</div>

			{/* Cursor */}
			<div
				style={{
					position: 'absolute',
					left: cursorX,
					top: cursorY,
					opacity: cursorOpacity,
					scale: pressed ? 0.86 : 1,
					transformOrigin: '0 0',
				}}
			>
				<CursorIcon size={46} />
			</div>
		</div>
	);
};
