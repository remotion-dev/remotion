import {loadFont} from '@remotion/fonts';
import {AbsoluteFill} from 'remotion';

const fontFamily = 'Bangers, sans-serif';
const text = 'Hamburgefonstiv';

export const pr11215FontPromise = loadFont({
	family: 'Bangers',
	url: new URL('../../../../example/public/bangers.woff2', import.meta.url)
		.href,
	format: 'woff2',
});

const Component: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: 'white',
				justifyContent: 'center',
				alignItems: 'center',
				gap: 24,
			}}
		>
			<div style={{display: 'flex', alignItems: 'center', gap: 20}}>
				<div style={{fontFamily: 'sans-serif', width: 60}}>HTML</div>
				<div style={{fontFamily, fontSize: 42}}>{text}</div>
			</div>
			<div style={{display: 'flex', alignItems: 'center', gap: 20}}>
				<div style={{fontFamily: 'sans-serif', width: 60}}>SVG</div>
				<svg
					viewBox="0 0 360 52"
					style={{width: 360, height: 52}}
					xmlns="http://www.w3.org/2000/svg"
				>
					<text x="0" y="42" fill="black" style={{fontFamily, fontSize: 42}}>
						{text}
					</text>
				</svg>
			</div>
		</AbsoluteFill>
	);
};

export const pr11215SvgFontRepro = {
	component: Component,
	id: 'pr-11215-svg-font-repro',
	width: 600,
	height: 220,
	fps: 30,
	durationInFrames: 1,
} as const;
