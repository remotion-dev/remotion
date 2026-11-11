export const svgFontMediaCache = ({active}: {active: boolean | null}) => {
	const Fixture = () => (
		<svg width={100} height={60}>
			<rect width={100} height={60} fill="white" />
			<text style={{fontFamily: '"External SVG, class font"', fontSize: 0}}>
				Cache
			</text>
			{active === null ? (
				<style media="(min-width: 500px)">{'rect.marker {fill:red}'}</style>
			) : null}
			<rect
				className="marker"
				x={10}
				y={10}
				width={70}
				height={40}
				fill={active ? 'red' : 'blue'}
			/>
		</svg>
	);
	return {
		component: Fixture,
		id: `svg-font-media-cache-${active === null ? 'query' : active ? 'active' : 'inactive'}`,
		width: 100,
		height: 60,
		fps: 30,
		durationInFrames: 1,
	} as const;
};
