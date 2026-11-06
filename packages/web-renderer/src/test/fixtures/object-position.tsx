import React, {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill, Img, useCurrentFrame} from 'remotion';

const svg =
	'data:image/svg+xml,' +
	encodeURIComponent(
		'<svg xmlns="http://www.w3.org/2000/svg" width="80" height="40"><path fill="red" d="M0 0h40v20H0z"/><path fill="blue" d="M40 0h40v20H40z"/><path fill="lime" d="M0 20h40v20H0z"/><path fill="yellow" d="M40 20h40v20H40z"/></svg>',
	);
const png =
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAAoCAYAAABpYH0BAAAAdElEQVR4nO3QsQ3AMADDsPz/dPpBOxXWQBjaDZ57zi0XuPDe/gFAgOUCFwACLLd/ABBgucAFgADL7R8ABFgucAEgwHL7BwABlgtcAPj3xfRuPIAAAQIEGN4aCCDAdgABAgQIMLw1EECA7QACBAgQYHhroK8eVPkFhWjpRZMAAAAASUVORK5CYII=';
const cases = [
	['contain', 'left top'],
	['contain', 'right bottom'],
	['cover', '0% 100%'],
	['cover', '100% 0%'],
	['none', '10px -5px'],
	['scale-down', 'right 5px bottom 10px'],
	['fill', '10px 10px'],
	['contain', 'calc(100% - 5px) calc(50% + 10px)'],
] as const;

const Canvas: React.FC<{readonly style: React.CSSProperties}> = ({style}) => {
	const ref = useRef<HTMLCanvasElement>(null);
	useLayoutEffect(() => {
		const ctx = ref.current!.getContext('2d')!;
		for (const [i, color] of ['red', 'blue', 'lime', 'yellow'].entries()) {
			ctx.fillStyle = color;
			ctx.fillRect((i % 2) * 40, Math.floor(i / 2) * 20, 40, 20);
		}
	}, []);
	return <canvas ref={ref} width={80} height={40} style={style} />;
};

const Component: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill
			style={{
				backgroundColor: 'white',
				display: 'grid',
				gridTemplateColumns: 'repeat(8, 60px)',
				gridTemplateRows: 'repeat(3, 80px)',
			}}
		>
			{['svg', 'png', 'canvas'].flatMap((kind) =>
				cases.map(([objectFit, position]) => {
					const style: React.CSSProperties = {
						display: 'block',
						width: 60,
						height: 80,
						objectFit,
						objectPosition: position,
						backgroundColor: '#ddd',
						transform: `translate(${frame * 2}px, ${-frame}px)`,
					};
					return kind === 'canvas' ? (
						<Canvas key={kind + objectFit + position} style={style} />
					) : (
						<Img
							key={kind + objectFit + position}
							src={kind === 'svg' ? svg : png}
							style={style}
						/>
					);
				}),
			)}
		</AbsoluteFill>
	);
};

export const objectPosition = {
	component: Component,
	id: 'object-position',
	width: 480,
	height: 240,
	fps: 25,
	durationInFrames: 2,
} as const;
