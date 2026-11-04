import type React from 'react';
import {AbsoluteFill} from 'remotion';

export const blendModes = [
	'multiply',
	'screen',
	'overlay',
	'darken',
	'lighten',
	'color-dodge',
	'color-burn',
	'hard-light',
	'soft-light',
	'difference',
	'exclusion',
	'hue',
	'saturation',
	'color',
	'luminosity',
] as const;

export const blendModesBackdrop = 'rgb(50, 120, 200)';
export const blendModesSource = 'rgb(220, 90, 40)';
const CELL_SIZE = 40;

const AllModes: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: blendModesBackdrop}}>
			{blendModes.map((mode, i) => (
				<div
					key={mode}
					style={{
						position: 'absolute',
						left: i * CELL_SIZE,
						top: 0,
						width: CELL_SIZE,
						height: CELL_SIZE,
						backgroundColor: blendModesSource,
						mixBlendMode: mode,
					}}
				/>
			))}
		</AbsoluteFill>
	);
};

export const mixBlendModeAllModes = {
	component: AllModes,
	id: 'mix-blend-mode-all-modes',
	width: CELL_SIZE * blendModes.length,
	height: CELL_SIZE,
	fps: 30,
	durationInFrames: 1,
} as const;

const cell = (i: number): React.CSSProperties => ({
	position: 'absolute',
	left: i * 100,
	top: 0,
	width: 100,
	height: 100,
});

const fill: React.CSSProperties = {
	position: 'absolute',
	inset: 0,
};

const Groups: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: 'rgb(128, 128, 128)'}}>
			{/* Blends with the backdrop */}
			<div
				style={{...cell(0), backgroundColor: 'red', mixBlendMode: 'multiply'}}
			/>
			{/* The child is grouped with its parent before blending */}
			<div
				style={{
					...cell(1),
					backgroundColor: 'yellow',
					mixBlendMode: 'multiply',
				}}
			>
				<div
					style={{
						...fill,
						top: 50,
						backgroundColor: 'cyan',
					}}
				/>
			</div>
			{/* Isolated groups do not blend with content behind them */}
			<div style={{...cell(2), isolation: 'isolate'}}>
				<div
					style={{...fill, backgroundColor: 'red', mixBlendMode: 'multiply'}}
				/>
			</div>
			<div style={{...cell(3), opacity: 0.5}}>
				<div style={{...fill, backgroundColor: 'white'}} />
				<div
					style={{...fill, backgroundColor: 'red', mixBlendMode: 'multiply'}}
				/>
			</div>
			<div style={{...cell(4), transform: 'translateX(0px)'}}>
				<div
					style={{...fill, backgroundColor: 'red', mixBlendMode: 'multiply'}}
				/>
			</div>
			{/* Not a stacking context, blends through */}
			<div style={cell(5)}>
				<div
					style={{...fill, backgroundColor: 'red', mixBlendMode: 'multiply'}}
				/>
			</div>
			{/* Blend mode together with a filter */}
			<div
				style={{
					...cell(6),
					backgroundColor: 'red',
					mixBlendMode: 'screen',
					filter: 'drop-shadow(0px 0px 0px black)',
				}}
			/>
		</AbsoluteFill>
	);
};

export const mixBlendModeGroups = {
	component: Groups,
	id: 'mix-blend-mode-groups',
	width: 700,
	height: 100,
	fps: 30,
	durationInFrames: 1,
} as const;
