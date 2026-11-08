import {AbsoluteFill, Img, useCurrentFrame} from 'remotion';
import {rasterMask} from './mask-image-url-sizing';

const cases: React.CSSProperties[] = [
	{},
	{backgroundRepeat: 'repeat-x', backgroundPosition: '0% 50%'},
	{backgroundRepeat: 'repeat-y', backgroundPosition: '50% 0%'},
	{backgroundRepeat: 'no-repeat', backgroundPosition: 'right bottom'},
	{backgroundSize: '32px 16px', backgroundPosition: '12px 8px'},
	{
		backgroundSize: '50% auto',
		backgroundRepeat: 'no-repeat',
		backgroundPosition: '50% 50%',
	},
	{backgroundSize: 'contain', backgroundRepeat: 'no-repeat'},
	{backgroundSize: 'cover', backgroundRepeat: 'no-repeat'},
	{backgroundOrigin: 'border-box', border: '4px solid blue', padding: 4},
	{backgroundOrigin: 'padding-box', border: '4px solid blue', padding: 4},
	{backgroundOrigin: 'content-box', border: '4px solid blue', padding: 4},
	{
		backgroundClip: 'content-box',
		backgroundOrigin: 'content-box',
		border: '4px solid blue',
		padding: 4,
	},
];

const Component: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill
			style={{
				background: 'white',
				display: 'grid',
				gridTemplateColumns: 'repeat(4, 100px)',
				gridTemplateRows: 'repeat(3, 64px)',
			}}
		>
			<Img src={rasterMask} style={{display: 'none'}} />
			{cases.map((style) => (
				<div
					key={JSON.stringify(style)}
					style={{
						width: 100,
						height: 64,
						boxSizing: 'border-box',
						backgroundColor: 'red',
						backgroundImage: `url("${rasterMask}")`,
						...style,
						transform: `translate(${frame}px, ${frame}px)`,
					}}
				/>
			))}
		</AbsoluteFill>
	);
};

export const backgroundImageUrl = {
	component: Component,
	id: 'background-image-url',
	width: 400,
	height: 192,
	fps: 25,
	durationInFrames: 2,
} as const;
