import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {rasterMask} from './mask-image-url-sizing';

const Component = () => {
	const frame = useCurrentFrame();
	const cases = [
		{maskPosition: '50% 50%', maskRepeat: 'no-repeat'},
		{maskPosition: 'right bottom', maskRepeat: 'no-repeat'},
		{maskPosition: `${-4 + frame * 2}px 6px`, maskRepeat: 'no-repeat'},
		{maskPosition: `${3 + frame * 2}px 7px`, maskRepeat: 'repeat-x'},
		{maskPosition: '5px -3px', maskRepeat: 'repeat-y'},
		{maskPosition: '7px 3px', maskRepeat: 'repeat'},
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

export const maskImageUrlPosition = {
	component: Component,
	durationInFrames: 2,
	fps: 30,
	height: 112,
	id: 'mask-image-url-position',
	width: 240,
} as const;
