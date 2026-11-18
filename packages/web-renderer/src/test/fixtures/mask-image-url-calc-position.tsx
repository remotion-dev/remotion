import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {rasterMask} from './mask-image-url-sizing';

const Component = () => {
	const frame = useCurrentFrame();
	const cases = [
		{
			maskPosition: `calc(50% + ${2 + frame * 2}px) calc(100% - 4px)`,
			maskRepeat: 'no-repeat',
		},
		{maskPosition: 'right 4px bottom 6px', maskRepeat: 'no-repeat'},
		{maskPosition: 'calc(0% - 4px) calc(50% + 2px)', maskRepeat: 'repeat-x'},
		{maskPosition: 'calc(100% - 3px) calc(0% - 2px)', maskRepeat: 'repeat-y'},
		{maskPosition: 'calc(50% + min(10px, 25%)) 50%', maskRepeat: 'no-repeat'},
		{maskPosition: 'clamp(2px, 25%, 16px) max(4px, 50%)', maskRepeat: 'repeat'},
	];
	return (
		<AbsoluteFill>
			{cases.map((style, index) => (
				<div
					key={`${style.maskPosition}:${style.maskRepeat}`}
					style={{
						position: 'absolute',
						left: 8 + (index % 3) * 80,
						top: 8 + Math.floor(index / 3) * 56,
						width: 64,
						height: 40,
						backgroundColor: '#e5484d',
						maskImage: `url("${rasterMask}")`,
						maskSize: '16px 8px',
						...style,
					}}
				/>
			))}
		</AbsoluteFill>
	);
};

export const maskImageUrlCalcPosition = {
	component: Component,
	durationInFrames: 2,
	fps: 30,
	height: 112,
	id: 'mask-image-url-calc-position',
	width: 240,
} as const;
