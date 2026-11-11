export const svgNoUseChart = {
	id: 'svg-no-use-chart',
	width: 128,
	height: 128,
	fps: 30,
	durationInFrames: 1,
	component: () => (
		<svg width="128" height="128" xmlns="http://www.w3.org/2000/svg">
			<rect width="128" height="128" fill="white" />
			{Array.from({length: 10000}, (_, index) => (
				<path
					key={index}
					d={`M${14 + (index % 100)} ${14 + Math.floor(index / 100)}h1v1h-1Z`}
					fill={index % 2 ? 'blue' : 'red'}
				/>
			))}
			<text fontSize="0">Chart label</text>
		</svg>
	),
} as const;
