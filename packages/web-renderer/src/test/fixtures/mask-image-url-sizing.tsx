import {AbsoluteFill} from 'remotion';

// A 16 × 8 image: opaque black on the left, transparent black on the right. Using black also
// verifies that raster masks use alpha, rather than luminance.
export const rasterMask =
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAICAYAAADwdn+XAAAAFUlEQVR4nGNgYGD4TwATBKMGDHkDAGFkP8G/9aiCAAAAAElFTkSuQmCC';

const styles: React.CSSProperties[] = [
	{maskSize: '40px 20px', maskRepeat: 'repeat'},
	{maskSize: '40px 20px', maskRepeat: 'repeat-x'},
	{maskSize: '40px 20px', maskRepeat: 'repeat-y'},
	{maskSize: '40px 20px', maskRepeat: 'no-repeat'},
	{maskSize: 'contain', maskRepeat: 'no-repeat'},
	{maskSize: 'cover', maskRepeat: 'no-repeat'},
	{maskSize: '50% auto', maskRepeat: 'repeat'},
	{maskSize: 'auto 20px', maskRepeat: 'repeat'},
];

const Component: React.FC = () => (
	<AbsoluteFill
		style={{
			backgroundColor: '#eee',
			padding: 20,
			display: 'grid',
			gridTemplateColumns: 'repeat(4, 100px)',
			gridTemplateRows: 'repeat(2, 60px)',
			gap: 20,
		}}
	>
		{styles.map((style) => (
			<div
				key={`${style.maskSize}:${style.maskRepeat}`}
				style={{
					...style,
					width: 100,
					height: 60,
					backgroundColor: '#e5484d',
					maskImage: `url("${rasterMask}")`,
					maskPosition: '0% 0%',
				}}
			/>
		))}
	</AbsoluteFill>
);

export const maskImageUrlSizing = {
	component: Component,
	durationInFrames: 1,
	fps: 25,
	height: 180,
	id: 'mask-image-url-sizing',
	width: 500,
} as const;
