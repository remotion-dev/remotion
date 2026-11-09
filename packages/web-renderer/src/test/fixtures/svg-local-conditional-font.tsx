import {useEffect, useState} from 'react';
import {AbsoluteFill, useDelayRender, useCurrentFrame} from 'remotion';

const dataUrls = Promise.all(
	['bangers.woff2', 'Roboto-Medium.ttf'].map(async (file) => {
		const blob = await (
			await fetch(
				new URL(`../../../../example/public/${file}`, import.meta.url),
			)
		).blob();
		return new Promise<string>((resolve) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as string);
			reader.readAsDataURL(blob);
		});
	}),
);
let loadedUrls: string[] | null = null;
export const svgLocalConditionalFontReady = dataUrls.then((urls) => {
	loadedUrls = urls;
});
const Component = ({useDataUrls = true}: {readonly useDataUrls?: boolean}) => {
	const {delayRender, continueRender} = useDelayRender();
	const [urls, setUrls] = useState(
		useDataUrls
			? loadedUrls
			: ['bangers.woff2', 'Roboto-Medium.ttf'].map(
					(file) =>
						new URL(`../../../../example/public/${file}`, import.meta.url).href,
				),
	);
	const [handle] = useState(() =>
		delayRender('Loading SVG-local conditional font'),
	);
	const frame = useCurrentFrame();
	useEffect(() => {
		if (useDataUrls) dataUrls.then(setUrls);
	}, [useDataUrls]);
	useEffect(() => {
		if (!urls) return;
		document.fonts
			.load('34px "Local conditional font"')
			.then(() => continueRender(handle));
	}, [handle, urls, continueRender]);
	if (!urls) return null;
	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<svg width={500} height={140}>
				<style>{`
@media(min-width:900px){@font-face{font-family:"Local conditional font";src:url("${urls[0]}") format("woff2")} .local-background{fill:#d7e8f5}}
@media(max-width:899px){@font-face{font-family:"Local conditional font";src:url("${urls[1]}") format("truetype")} .local-background{fill:red}}
@supports(display:grid){.local-text{fill:#123456}}
.local-text{font-family:"Local conditional font"}
`}</style>
				<rect className="local-background" width={500} height={140} />
				<text
					className="local-text"
					x={12}
					y={54}
					style={{fontSize: 34 + frame * 2}}
				>
					SVG-local media font
				</text>
				<text
					className="local-text"
					x={12}
					y={110}
					style={{fontSize: 34 + frame * 2}}
				>
					Preserve unrelated SVG styles
				</text>
			</svg>
		</AbsoluteFill>
	);
};

export const svgLocalConditionalFont = {
	component: Component,
	id: 'svg-local-conditional-font',
	width: 500,
	height: 140,
	fps: 30,
	durationInFrames: 2,
} as const;

export const svgLocalConditionalUrlFont = {
	...svgLocalConditionalFont,
	component: () => <Component useDataUrls={false} />,
	id: 'svg-local-conditional-url-font',
} as const;
