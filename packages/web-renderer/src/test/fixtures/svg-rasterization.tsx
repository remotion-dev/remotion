const ScopeComponent = () => (
	<div
		style={{position: 'absolute', width: 400, height: 160, background: 'white'}}
	>
		{[8, 208].map((left, index) => (
			<svg
				key={left}
				width={320}
				height={100}
				style={{position: 'absolute', left, top: 88, width: 160, height: 50}}
			>
				<style>{`@media (min-width:1px) { .scope-marker {fill:lime;} ${index === 0 ? 'g > svg .scope-marker, svg svg .scope-marker' : ':is(g svg, .absent) > .scope-marker, g:has(> svg) .scope-marker'} {fill:red;} }`}</style>
				<rect className="scope-marker" width={160} height={50} />
			</svg>
		))}
	</div>
);
const RootComponent = () => (
	<div
		style={{position: 'absolute', width: 400, height: 160, background: 'white'}}
	>
		<svg
			className="root-painted"
			data-info="a,b:root"
			data-remotion-raster-root="untouched"
			width={320}
			height={100}
			style={{position: 'absolute', left: 8, top: 88, width: 160, height: 50}}
		>
			<style>{`@namespace s url(http://www.w3.org/2000/svg); @media (min-width:1px) {
 :root {stroke-linejoin:round;}
 :is(s|svg.root-painted[data-info="a,b:root"], .absent), #absent {stroke:red;stroke-width:4px;}
 s|svg.root-painted[data-info="a,b:root"] {stroke:blue;}
 .root-marker {fill:lime;}
 g > s|svg.root-painted, s|svg s|svg.root-painted {stroke:red!important;}
 [data-remotion-raster-root=""], [data-remotion-raster-root\\-] {stroke:red!important;}
 }`}</style>
			<rect className="root-marker" x={8} y={8} width={144} height={34} />
		</svg>
	</div>
);

const AuthoredScopeComponent = () => (
	<div
		style={{position: 'absolute', width: 400, height: 160, background: 'white'}}
	>
		<svg
			className="authored-scope"
			width={320}
			height={96}
			style={{position: 'absolute', left: 8, top: 88, width: 160, height: 48}}
		>
			<style>{`@scope (.authored-scope) { .scope-fill {fill:lime;} } .scope-fill {fill:red;}`}</style>
			<rect className="scope-fill" width={320} height={96} />
		</svg>
	</div>
);

const PrecisionComponent = () => (
	<div
		style={{position: 'absolute', width: 400, height: 160, background: 'white'}}
	>
		<svg
			width={320}
			height={100}
			style={{
				position: 'absolute',
				left: 8.25,
				top: 88.25,
				width: 160.5,
				height: 50.5,
			}}
		>
			<rect width={320} height={100} fill="#123355" />
			<rect x={16} y={12} width={60.25} height={8.5} fill="blue" />
		</svg>
	</div>
);

const TransformComponent = () => (
	<div
		style={{position: 'absolute', width: 400, height: 160, background: 'white'}}
	>
		<svg
			width={320}
			height={100}
			style={{
				position: 'absolute',
				left: 16,
				top: 80,
				width: 160,
				height: 50,
				transform: 'matrix(0.9,0.1,0.05,1,0,0)',
				transformOrigin: '0 0',
			}}
		>
			<rect width={320} height={100} fill="#123355" />
			<rect x={16} y={12} width={60} height={8} fill="blue" />
		</svg>
	</div>
);

const ClipComponent = () => (
	<div
		style={{position: 'absolute', width: 400, height: 160, background: 'white'}}
	>
		<div
			style={{
				position: 'absolute',
				left: 16,
				top: 80,
				width: 192,
				height: 64,
				overflow: 'hidden',
			}}
		>
			<svg
				width={416}
				height={192}
				style={{
					position: 'absolute',
					left: -8,
					top: -8,
					width: 208,
					height: 96,
				}}
			>
				<rect width={416} height={192} fill="#123355" />
				<rect x={16} y={12} width={60} height={8} fill="blue" />
			</svg>
		</div>
	</div>
);

const dimensions = {
	width: 400,
	height: 160,
	fps: 30,
	durationInFrames: 1,
} as const;
export const svgRasterizationScenes = [
	{component: ScopeComponent, id: 'svg-rasterization-scope'},
	{component: RootComponent, id: 'svg-rasterization-root'},
	{component: AuthoredScopeComponent, id: 'svg-rasterization-authored-scope'},
	{component: PrecisionComponent, id: 'svg-rasterization-precision'},
	{component: TransformComponent, id: 'svg-rasterization-transform'},
	{component: ClipComponent, id: 'svg-rasterization-clip'},
].map((scene) => ({...dimensions, ...scene}));
