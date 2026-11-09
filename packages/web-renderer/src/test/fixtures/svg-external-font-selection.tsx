import {loadFont} from '@remotion/fonts';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

export const svgExternalFontReady = Promise.all([
	loadFont({
		family: 'External SVG, class font',
		url: new URL('../../../../example/public/bangers.woff2', import.meta.url)
			.href,
		format: 'woff2',
	}),
	loadFont({
		family: 'Template-only registered face',
		url: new URL('../../../../example/public/bangers.woff2', import.meta.url)
			.href,
		format: 'woff2',
	}),
]);

const Component: React.FC<{styleType?: string}> = ({styleType}) => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<style>{`.svg-font-from-external-css { font-family: "External SVG, class font"; font-size: ${40 + frame * 2}px; }`}</style>
			<svg width={600} height={320} viewBox="0 0 600 320">
				<style media={frame === 0 ? 'print' : 'screen'}>
					{
						'@namespace svg url("http://www.w3.org/2000/svg");svg|rect{fill:yellow}'
					}
				</style>
				<style>
					{
						'@namespace svg url("http://www.w3.org/2000/svg");svg|rect:nth-child(3){fill:red}'
					}
				</style>
				<rect width={20} height={20} />
				<defs>
					<path id="external-svg-text-path" d="M 12 194 L 580 194" />
					<text id="external-svg-use-template">Template inheritance</text>
					<text
						id="external-svg-explicit-template"
						style={{
							fontFamily: '"Template-only registered face"',
							fontSize: 24,
						}}
					>
						Template own font
					</text>
				</defs>
				<text className="svg-font-from-external-css" x={12} y={44}>
					External class selection
				</text>
				<g className="svg-font-from-external-css">
					<text x={12} y={94}>
						Inherited font selection
					</text>
				</g>
				<text x={12} y={144} style={{fontFamily: 'serif', fontSize: 30}}>
					Base{' '}
					<tspan className="svg-font-from-external-css">nested tspan</tspan>
				</text>
				<text>
					<textPath
						className="svg-font-from-external-css"
						href="#external-svg-text-path"
					>
						Text path selection
					</textPath>
				</text>
				<use
					href="#external-svg-use-template"
					x={12}
					y={250}
					style={{fontFamily: 'serif', fontSize: 30}}
				/>
				<use href="#external-svg-explicit-template" x={360} y={250} />
				<g style={{fontFamily: 'serif', fontSize: 24}}>
					<text id="external-svg-visible-template" x={12} y={300}>
						Visible template
					</text>
				</g>
				<use
					href="#external-svg-visible-template"
					x={270}
					y={0}
					style={{fontFamily: 'monospace', fontSize: 30}}
				/>
				<style type={styleType ?? (frame === 0 ? 'text/css' : 'text/plain')}>
					{'/* Non-CSS style elements cannot carry font definitions. */'}
				</style>
			</svg>
		</AbsoluteFill>
	);
};

export const svgExternalFontSelection = {
	component: Component,
	id: 'svg-external-font-selection',
	width: 600,
	height: 320,
	fps: 30,
	durationInFrames: 2,
} as const;
