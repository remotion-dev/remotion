import {AbsoluteFill, Img} from 'remotion';

const swissFlag = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480">
	<g fill-rule="evenodd" stroke-width="1pt">
		<path fill="red" d="M0 0h640v480H0z"/>
		<g fill="#fff">
			<path d="M170 195h300v90H170z"/>
			<path d="M275 90h90v300h-90z"/>
		</g>
	</g>
</svg>`;

const Component: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				alignItems: 'center',
				backgroundColor: 'white',
				justifyContent: 'center',
			}}
		>
			<Img
				src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(swissFlag)}`}
				style={{height: 29, objectFit: 'cover', width: 38}}
			/>
		</AbsoluteFill>
	);
};

export const svgDataUri = {
	component: Component,
	id: 'svg-data-uri',
	width: 48,
	height: 39,
	fps: 25,
	durationInFrames: 1,
} as const;
