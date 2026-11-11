const Component = () => {
	return (
		<svg width={64} height={64} xmlns="http://www.w3.org/2000/svg">
			<rect width={64} height={64} fill="white" />
			<defs>
				<g id="repeated-use-geometry">
					{Array.from({length: 1000}, (_, index) => (
						<path
							key={index}
							d={`M${10 + (index % 40)} ${10 + Math.floor(index / 40)}h1v1h-1Z`}
							fill={index % 2 ? 'blue' : 'red'}
						/>
					))}
				</g>
			</defs>
			<text fontSize={0}>Chart label</text>
			{Array.from({length: 1000}, (_, index) => (
				<use key={index} href="#repeated-use-geometry" />
			))}
		</svg>
	);
};

export const svgRepeatedUse = {
	component: Component,
	id: 'svg-repeated-use',
	width: 64,
	height: 64,
	fps: 30,
	durationInFrames: 1,
} as const;
