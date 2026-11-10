import type {CSSProperties} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

const cases: {
	id: string;
	fontSize: number;
	value: string;
	pixels: number;
	line: CSSProperties['textDecorationLine'];
	inheritance: 'none' | 'value' | 'origin';
}[] = [
	{
		id: 'percent',
		fontSize: 24,
		value: '12.5%',
		pixels: 3,
		line: 'underline',
		inheritance: 'none',
	},
	{
		id: 'larger-font',
		fontSize: 48,
		value: '12.5%',
		pixels: 6,
		line: 'overline',
		inheritance: 'none',
	},
	{
		id: 'fractional-percent',
		fontSize: 80,
		value: '2.5%',
		pixels: 2,
		line: 'line-through',
		inheritance: 'none',
	},
	{
		id: 'calc',
		fontSize: 24,
		value: 'calc(12.5% + 1px)',
		pixels: 4,
		line: 'underline',
		inheritance: 'none',
	},
	{
		id: 'min',
		fontSize: 48,
		value: 'min(12.5%, 5px)',
		pixels: 5,
		line: 'overline',
		inheritance: 'none',
	},
	{
		id: 'max',
		fontSize: 24,
		value: 'max(12.5%, 5px)',
		pixels: 5,
		line: 'line-through',
		inheritance: 'none',
	},
	{
		id: 'clamp',
		fontSize: 48,
		value: 'clamp(2px, 12.5%, 5px)',
		pixels: 5,
		line: 'underline',
		inheritance: 'none',
	},
	{
		id: 'inherited-value',
		fontSize: 48,
		value: '12.5%',
		pixels: 6,
		line: 'overline',
		inheritance: 'value',
	},
	{
		id: 'ancestor-origin',
		fontSize: 48,
		value: '12.5%',
		pixels: 3,
		line: 'underline',
		inheritance: 'origin',
	},
	{
		id: 'tiny-percent',
		fontSize: 24,
		value: '0.25%',
		pixels: 0.06,
		line: 'underline',
		inheritance: 'none',
	},
	{
		id: 'zero-calc',
		fontSize: 24,
		value: 'calc(12.5% - 3px)',
		pixels: 0,
		line: 'overline',
		inheritance: 'none',
	},
	{
		id: 'nested-calc',
		fontSize: 24,
		value: 'calc(25% + min(1px, 10%))',
		pixels: 7,
		line: 'underline',
		inheritance: 'none',
	},
	{
		id: 'em-calc',
		fontSize: 24,
		value: 'calc(12.5% + 0.125em)',
		pixels: 6,
		line: 'line-through',
		inheritance: 'none',
	},
	{
		id: 'round-math',
		fontSize: 24,
		value: 'round(up, 10%, 1px)',
		pixels: 3,
		line: 'underline',
		inheritance: 'none',
	},
];

const Case = ({
	entry,
	absolute,
}: {
	readonly entry: (typeof cases)[number];
	readonly absolute: boolean;
}) => {
	const frame = useCurrentFrame();
	return (
		<div
			style={{
				position: 'absolute',
				left: 14,
				top: 16,
				fontFamily: 'Arial, sans-serif',
				fontSize: entry.inheritance === 'none' ? entry.fontSize : 24,
				lineHeight: 1.4,
				color: '#123456',
				textDecorationColor: '#d02040',
				textDecorationLine: entry.inheritance === 'value' ? 'none' : entry.line,
				textDecorationThickness: absolute ? `${entry.pixels}px` : entry.value,
				transform: `scale(${frame ? 1.125 : 1})`,
				transformOrigin: '0 0',
			}}
		>
			<span
				style={{
					fontSize: entry.fontSize,
					textDecorationLine:
						entry.inheritance === 'value' ? entry.line : undefined,
					textDecorationColor: '#d02040',
					textDecorationThickness:
						entry.inheritance === 'value' ? 'inherit' : undefined,
				}}
			>
				Ag
			</span>
		</div>
	);
};

const cellWidth = 220;
const cellHeight = 190;

export const textDecorationLengths = cases.map((entry) => {
	const makeFixture = (absolute: boolean) => {
		const Component = () => (
			<AbsoluteFill style={{backgroundColor: 'white'}}>
				<Case entry={entry} absolute={absolute} />
			</AbsoluteFill>
		);

		return {
			id: `decoration-length-${entry.id}${absolute ? '-px' : ''}`,
			component: Component,
			width: cellWidth,
			height: cellHeight,
			fps: 30,
			durationInFrames: 2,
		} as const;
	};

	return {
		id: entry.id,
		fixture: makeFixture(false),
		reference: makeFixture(true),
	};
});

// All cases in one composition. Each cell has the size of a standalone case
// composition, which already contains the scaled glyphs and decorations, so
// cells never paint into each other.
const gridColumns = 4;

export const textDecorationLengthGridCells = cases.map((entry, index) => ({
	id: entry.id,
	left: (index % gridColumns) * cellWidth,
	top: Math.floor(index / gridColumns) * cellHeight,
	width: cellWidth,
	height: cellHeight,
}));

const makeGrid = (absolute: boolean) => {
	const Component = () => (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			{cases.map((entry, index) => (
				<div
					key={entry.id}
					style={{
						position: 'absolute',
						left: textDecorationLengthGridCells[index].left,
						top: textDecorationLengthGridCells[index].top,
						width: cellWidth,
						height: cellHeight,
					}}
				>
					<Case entry={entry} absolute={absolute} />
				</div>
			))}
		</AbsoluteFill>
	);

	return {
		id: `decoration-length-grid${absolute ? '-px' : ''}`,
		component: Component,
		width: gridColumns * cellWidth,
		height: Math.ceil(cases.length / gridColumns) * cellHeight,
		fps: 30,
		durationInFrames: 2,
	} as const;
};

export const textDecorationLengthGrid = {
	fixture: makeGrid(false),
	reference: makeGrid(true),
};
