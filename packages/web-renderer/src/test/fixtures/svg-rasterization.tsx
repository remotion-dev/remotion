const ScopeComponent = () => (
	<div
		style={{position: 'absolute', width: 400, height: 160, background: 'white'}}
	>
		{[8, 208].map((left, index) => (
			<svg
				key={left}
				width={index === 0 ? 160 : 320}
				height={index === 0 ? 50 : 100}
				viewBox={index === 0 ? '0 0 160 50' : undefined}
				style={{position: 'absolute', left, top: 88, width: 160, height: 50}}
			>
				<style>{`.scope-marker-${index} {fill:${index === 0 ? 'blue' : 'lime'};--label:"10rem";--paint:url(data:image/svg+xml,%3C!--10vw--%3E);} /* 20rem */ @media (min-width:${index === 0 ? 300 : 1}px) { .scope-marker-${index} {fill:lime;} ${index === 0 ? 'g > svg .scope-marker-0, svg svg .scope-marker-0' : ':is(g svg, .absent) > .scope-marker-1, g:has(> svg) .scope-marker-1, svg:nth-last-child(1 of svg svg) > .scope-marker-1, :is(:-webkit-any(:is(svg svg), .absent), :-moz-any(:is(svg svg), .absent)) > .scope-marker-1'} {fill:red;} }`}</style>
				<rect
					className={`scope-marker scope-marker-${index}`}
					width={160}
					height={50}
				/>
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
 g > s|svg.root-painted, s|svg s|svg.root-painted, s|svg.root-painted:nth-child(1 of s|svg s|svg) {stroke:red!important;}
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

const PseudoComponent = () => (
	<div
		style={{position: 'absolute', width: 400, height: 160, background: 'white'}}
	>
		{[true, false].map((relative, index) => {
			const variant = relative ? 'relative' : 'absolute';
			return (
				<svg
					key={variant}
					data-pseudo-variant={variant}
					width={320}
					height={96}
					style={{
						position: 'absolute',
						left: 8 + index * 200,
						top: 88,
						width: 160,
						height: 48,
					}}
				>
					<style>{`${relative ? ':root {font-size:20px;}' : ''} @media (min-width:1px) {
					.panel {position:relative;width:160px;height:48px;background:#123355;}
					svg .panel-${variant}::before {content:"";position:absolute;left:16px;top:12px;width:${relative ? '3rem' : '60px'};height:${relative ? '0.4rem' : '8px'};background:blue;}
				}`}</style>
					<foreignObject width={160} height={48}>
						<div
							{...{xmlns: 'http://www.w3.org/1999/xhtml'}}
							className={`panel panel-${variant}`}
						/>
					</foreignObject>
				</svg>
			);
		})}
	</div>
);

const dimensions = {
	width: 400,
	height: 160,
	fps: 30,
	durationInFrames: 1,
} as const;
export const svgRasterizationScenes = [
	{...dimensions, id: 'svg-rasterization-pseudo', component: PseudoComponent},
	{component: ScopeComponent, id: 'svg-rasterization-scope'},
	{component: RootComponent, id: 'svg-rasterization-root'},
	{component: AuthoredScopeComponent, id: 'svg-rasterization-authored-scope'},
	{component: PrecisionComponent, id: 'svg-rasterization-precision'},
	{component: TransformComponent, id: 'svg-rasterization-transform'},
	{component: ClipComponent, id: 'svg-rasterization-clip'},
].map((scene) => ({...dimensions, ...scene}));
