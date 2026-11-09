import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {rasterMask} from './mask-image-url-sizing';

const cases = [
	['calc(50% - 32px) calc(50% - 16px)', 'no-repeat'],
	['calc(50% - 32px) auto', 'repeat'],
	['auto calc(50% - 16px)', 'repeat-x'],
	['min(50%, 64px) max(16px, 25%)', 'repeat-y'],
	['clamp(16px, 25%, 48px) clamp(8px, 25%, 24px)', 'repeat'],
	['calc((50% - 16px) / 2) calc(50% - 16px)', 'no-repeat'],
	['calc(10% - 100px) 16px', 'repeat'],
	['calc(25% + 8px) calc(50% - 8px)', 'no-repeat'],
] as const;
const literalSizes = [
	[
		'32px 16px',
		'32px auto',
		'auto 16px',
		'64px 16px',
		'32px 16px',
		'24px 16px',
		'0px 16px',
		'40px 24px',
	],
	[
		'48px 24px',
		'48px auto',
		'auto 24px',
		'64px 20px',
		'40px 20px',
		'32px 24px',
		'0px 16px',
		'48px 32px',
	],
];
const Component = ({literal = false}: {literal?: boolean}) => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill
			style={{
				display: 'grid',
				gridTemplateColumns: 'repeat(4, 176px)',
				gridTemplateRows: 'repeat(2, 88px)',
				gap: 8,
				padding: 12,
			}}
		>
			{cases.map(([maskSize, maskRepeat], index) => (
				<div
					key={maskSize}
					style={{
						width: 128 + frame * 32,
						height: 64 + frame * 16,
						backgroundColor: '#d04060',
						maskImage: `url("${rasterMask}")`,
						maskSize: literal ? literalSizes[frame][index] : maskSize,
						maskRepeat,
						maskPosition: '0% 0%',
					}}
				/>
			))}
		</AbsoluteFill>
	);
};

export const maskImageUrlMathSize = {
	component: Component,
	id: 'mask-image-url-math-size',
	width: 752,
	height: 208,
	fps: 30,
	durationInFrames: 2,
};

export const maskImageUrlMathSizeLiteral = {
	...maskImageUrlMathSize,
	id: 'mask-image-url-math-literal',
	component: () => <Component literal />,
};
