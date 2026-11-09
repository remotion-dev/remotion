import {AbsoluteFill, useCurrentFrame} from 'remotion';

const Component = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill>
			<style>{'.svg-root-opacity-class {opacity:.5}'}</style>
			{Array.from({length: 8}, (_, index) => (
				<div
					key={index}
					style={{
						position: 'absolute',
						left: 10 + index * 90,
						top: 10,
						width: 80,
						height: 80,
						opacity: index === 3 ? 0.5 : 1,
					}}
				>
					<svg
						width={80}
						height={80}
						opacity={index === 1 ? 0.5 : undefined}
						className={index === 6 ? 'svg-root-opacity-class' : undefined}
						style={{
							opacity:
								index === 0
									? frame === 0
										? 0.5
										: 0.25
									: index === 2 || index === 3
										? 0.5
										: index === 4
											? 0
											: undefined,
						}}
					>
						<g opacity={index === 2 || index === 5 ? 0.5 : 1}>
							<rect x={10} y={10} width={60} height={60} fill="red" />
						</g>
					</svg>
				</div>
			))}
		</AbsoluteFill>
	);
};

export const svgRootOpacity = {
	component: Component,
	id: 'svg-root-opacity',
	width: 730,
	height: 100,
	fps: 30,
	durationInFrames: 2,
} as const;
