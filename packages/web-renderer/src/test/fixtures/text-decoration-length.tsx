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

export const textDecorationLengths = cases.map((entry) => {
	const makeFixture = (absolute: boolean) => {
		const Component = () => {
			const frame = useCurrentFrame();
			return (
				<AbsoluteFill style={{backgroundColor: 'white'}}>
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
							textDecorationLine:
								entry.inheritance === 'value' ? 'none' : entry.line,
							textDecorationThickness: absolute
								? `${entry.pixels}px`
								: entry.value,
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
				</AbsoluteFill>
			);
		};

		return {
			id: `decoration-length-${entry.id}${absolute ? '-px' : ''}`,
			component: Component,
			width: 220,
			height: 190,
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
