import {AbsoluteFill, useCurrentFrame} from 'remotion';

const Component = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill>
			<style>{'.svg-root-opacity-class {opacity:.5}'}</style>
			{Array.from({length: 11}, (_, index) => (
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
						className={
							index === 6
								? 'svg-root-opacity-class'
								: index === 8
									? 'svg-local-root-opacity'
									: undefined
						}
						style={{
							opacity:
								index === 0
									? frame === 0
										? 0.5
										: 0.25
									: index === 2 || index === 3 || index >= 9
										? 0.5
										: index === 4
											? 0
											: undefined,
						}}
					>
						{index === 8 ? (
							<style>{'.svg-local-root-opacity {opacity:.5 !important}'}</style>
						) : null}
						{index === 9 ? (
							<rect
								x={10}
								y={10}
								width={60}
								height={60}
								fill="red"
								style={{opacity: 'inherit'}}
							/>
						) : (
							<g
								opacity={index === 2 || index === 5 ? 0.5 : undefined}
								style={index === 10 ? {opacity: 'inherit'} : undefined}
							>
								<rect
									x={10}
									y={10}
									width={60}
									height={60}
									fill="red"
									style={index >= 9 ? {opacity: 'inherit'} : undefined}
								/>
							</g>
						)}
					</svg>
				</div>
			))}
		</AbsoluteFill>
	);
};

export const svgRootOpacity = {
	component: Component,
	id: 'svg-root-opacity',
	width: 1000,
	height: 100,
	fps: 30,
	durationInFrames: 2,
} as const;
