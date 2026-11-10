import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
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
const Component = ({literal = false}: {readonly literal?: boolean}) => {
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

const additionalMathSizes = [
	['round(nearest, 33%, 8px) round(up, 25%, 8px)', ['40px 16px', '56px 24px']],
	[
		'round(down, 50%, 16px) round(to-zero, calc(25% - 30px), 8px)',
		['64px 0px', '80px 0px'],
	],
	['mod(50%, 24px) rem(50%, 12px)', ['16px 8px', '8px 4px']],
	['rem(calc(25% - 64px), 24px) abs(calc(25% - 24px))', ['0px 8px', '0px 4px']],
	[
		'hypot(calc(25% - 8px), 0px) calc(sign(25% - 18px) * 8px)',
		['24px 0px', '32px 8px'],
	],
	['calc(sqrt(4) * 25%) calc(pow(2, 3) * 2px)', ['64px 16px', '80px 16px']],
	[
		'calc(exp(0) * 25% + 4px) calc(log(8, 2) * 4px)',
		['36px 12px', '44px 12px'],
	],
	['calc(sin(30deg) * 50%) calc(cos(60deg) * 50%)', ['32px 16px', '40px 20px']],
	[
		'calc(tan(atan2(1, tan(atan(1)))) * 25%) calc(sin(asin(cos(acos(0.5)))) * 50%)',
		['32px 16px', '40px 20px'],
	],
	['auto round(nearest, 33%, 8px)', ['auto 24px', 'auto 24px']],
	[
		'calc(progress(50%, 0px, 100px) * 100px) calc(progress(50%, 0px, 80px) * 80px)',
		['64px 32px', '80px 40px'],
	],
	[
		'clamp(16px, round(nearest, 25%, 8px), 64px) min(32px, max(8px, 25%))',
		['32px 16px', '40px 20px'],
	],
	['round(nearest, calc(25% + 8px), 8px) auto', ['40px auto', '48px auto']],
	['contain', ['contain', 'contain']],
	['cover', ['cover', 'cover']],
	['auto', ['auto', 'auto']],
] as const;

export const extendedMaskMathSizes = [
	...cases.map(([size, repeat], index) => ({
		size,
		repeat,
		literal: [literalSizes[0][index], literalSizes[1][index]],
	})),
	...additionalMathSizes.map(([size, literal], index) => ({
		size,
		literal,
		repeat: ['no-repeat', 'repeat', 'repeat-x', 'repeat-y'][index % 4],
	})),
];

const createExtendedMathFixture = (
	literal: boolean,
	opaque: boolean,
	multiple: boolean,
) => {
	const Extended = () => {
		const frame = useCurrentFrame();
		const halfAlpha = staticFile('mask-half-alpha.png');
		return (
			<AbsoluteFill
				style={{
					backgroundColor: opaque ? 'white' : 'transparent',
					display: 'grid',
					gridTemplateColumns: 'repeat(4,176px)',
					gridTemplateRows: 'repeat(6,88px)',
					gap: 8,
					padding: 12,
				}}
			>
				<Img src={halfAlpha} style={{display: 'none'}} />
				{extendedMaskMathSizes.map(
					({size, repeat, literal: canonical}, index) => {
						const authored = multiple ? `${size}, auto, ${size}` : size;
						const expected = multiple
							? `${canonical[frame]}, auto, ${canonical[frame]}`
							: canonical[frame];
						const maskSize = literal
							? CSS.supports('mask-size', authored)
								? expected
								: 'auto'
							: authored;
						return (
							<div
								key={size}
								style={{
									width: 128 + frame * 32,
									height: 64 + frame * 16,
									backgroundColor: '#d04060',
									maskImage: multiple
										? `url("${halfAlpha}"), none, url("${rasterMask}")`
										: `url("${index % 2 ? halfAlpha : rasterMask}")`,
									maskSize,
									maskRepeat: repeat,
									maskPosition: `${frame ? 25 : 0}% ${frame ? 50 : 0}%`,
									...(multiple
										? {
												maskComposite: [
													'subtract, add',
													'exclude, add',
													'intersect, add',
													'add',
												][index % 4],
											}
										: {}),
								}}
							/>
						);
					},
				)}
			</AbsoluteFill>
		);
	};

	return {
		component: Extended,
		id: `mask-math-extended-${literal ? 'literal' : 'math'}-${opaque ? 'opaque' : 'transparent'}-${multiple ? 'multiple' : 'single'}`,
		width: 752,
		height: 608,
		fps: 30,
		durationInFrames: 2,
	} as const;
};

export const maskMathExtendedOpaque = createExtendedMathFixture(
	false,
	true,
	false,
);
export const maskMathExtendedTransparent = createExtendedMathFixture(
	false,
	false,
	false,
);
export const maskMathExtendedMultipleOpaque = createExtendedMathFixture(
	false,
	true,
	true,
);
export const maskMathExtendedMultipleTransparent = createExtendedMathFixture(
	false,
	false,
	true,
);
export const maskMathExtendedLiteralOpaque = createExtendedMathFixture(
	true,
	true,
	false,
);
export const maskMathExtendedLiteralTransparent = createExtendedMathFixture(
	true,
	false,
	false,
);
export const maskMathExtendedLiteralMultipleOpaque = createExtendedMathFixture(
	true,
	true,
	true,
);
export const maskMathExtendedLiteralMultipleTransparent =
	createExtendedMathFixture(true, false, true);
