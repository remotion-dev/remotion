import {useEffect, useState} from 'react';
import {
	AbsoluteFill,
	Img,
	staticFile,
	useCurrentFrame,
	useDelayRender,
} from 'remotion';
import {rasterMask} from './mask-image-url-sizing';

const url = `url("${rasterMask}")`;
const halfAlpha =
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAICAYAAADwdn+XAAAAHElEQVR4nGNkYGBoYMAP8MozEdBMEIwaMBgMAAAGZgEQihGO0wAAAABJRU5ErkJggg==';
const halfUrl = `url("${halfAlpha}")`;
const styles: React.CSSProperties[] = [
	...(['add', 'subtract', 'intersect', 'exclude'] as const).map(
		(maskComposite) => ({maskImage: `${url}, ${url}`, maskComposite}),
	),
	{maskImage: `${url}, ${url}, ${url}`, maskComposite: 'subtract, add'},
	{maskImage: `${url}, ${url}, ${url}`, maskComposite: 'exclude, intersect'},
	{maskImage: `none, ${url}`, maskComposite: 'add'},
	{maskImage: `${url}, none`, maskComposite: 'subtract'},
	{maskImage: `none, ${url}`, maskComposite: 'intersect'},
	{maskImage: `${url}, ${url}`, maskComposite: 'add, intersect'},
	{
		maskImage: `${url}, ${url}, ${url}`,
		maskPosition: '0px 0px, 4px 2px',
		maskComposite: 'exclude',
	},
	{maskImage: url},
];

const partialStyles: React.CSSProperties[] = (
	['add', 'subtract', 'intersect', 'exclude'] as const
).map((maskComposite) => ({
	maskImage: `${halfUrl}, ${halfUrl}`,
	maskComposite,
}));

export const createMaskImageLayersFixture = (
	source: 'data' | 'url' | 'token-url' | 'blob',
	opaque: boolean,
) => {
	const Component = () => {
		const frame = useCurrentFrame();
		const {delayRender, continueRender} = useDelayRender();
		const [handle] = useState(() =>
			delayRender('Prepare alpha mask source URLs'),
		);
		const [sources, setSources] = useState<string[] | null>(null);
		useEffect(() => {
			const urls =
				source === 'data'
					? [rasterMask, halfAlpha]
					: source === 'url' || source === 'token-url'
						? [
								source === 'token-url'
									? new URL(
											'/mask-linear-gradient(red,blue).png',
											document.baseURI,
										).href
									: staticFile('mask-alpha)tile.png'),
								staticFile('mask-half-alpha.png'),
							]
						: [rasterMask, halfAlpha].map((src) =>
								URL.createObjectURL(
									new Blob(
										[
											Uint8Array.from(atob(src.split(',')[1]), (char) =>
												char.charCodeAt(0),
											),
										],
										{type: 'image/png'},
									),
								),
							);
			setSources(urls);
			return () => {
				if (source === 'blob') for (const src of urls) URL.revokeObjectURL(src);
			};
		}, []);
		useEffect(() => {
			if (sources !== null) continueRender(handle);
		}, [continueRender, handle, sources]);
		if (sources === null) return null;

		return (
			<AbsoluteFill
				style={{
					backgroundColor: opaque ? '#fff' : 'transparent',
					display: 'grid',
					gridTemplateColumns: 'repeat(4, 40px)',
					gridTemplateRows: 'repeat(4, 24px)',
					padding: 8,
					gap: 8,
				}}
			>
				<Img src={sources[0]} style={{display: 'none'}} />
				<Img src={sources[1]} style={{display: 'none'}} />
				{[...styles, ...partialStyles].map((style) => (
					<div
						key={`${style.maskImage}:${style.maskComposite}:${style.maskPosition}`}
						style={{
							width: 40,
							height: 24,
							backgroundColor: '#d04060',
							maskSize: '16px 8px',
							maskRepeat: 'no-repeat',
							maskPosition: `4px 4px, ${8 + frame * 4}px 4px, 6px 6px`,
							...style,
							maskImage: String(style.maskImage)
								.replaceAll(url, `url("${sources[0]}")`)
								.replaceAll(halfUrl, `url("${sources[1]}")`),
						}}
					/>
				))}
			</AbsoluteFill>
		);
	};

	return {
		component: Component,
		id: `mask-image-layers-${source}-${opaque ? 'opaque' : 'transparent'}`,
		width: 200,
		height: 136,
		fps: 25,
		durationInFrames: 2,
	} as const;
};

export const maskImageLayers = createMaskImageLayersFixture('data', true);
export const maskImageLayersTransparent = createMaskImageLayersFixture(
	'data',
	false,
);
export const maskImageLayersUrl = createMaskImageLayersFixture('url', true);
export const maskImageLayersUrlTransparent = createMaskImageLayersFixture(
	'url',
	false,
);
export const maskImageLayersBlob = createMaskImageLayersFixture('blob', true);
export const maskImageLayersBlobTransparent = createMaskImageLayersFixture(
	'blob',
	false,
);

export const maskImageLayersTokenUrl = createMaskImageLayersFixture(
	'token-url',
	true,
);
export const maskImageLayersTokenUrlTransparent = createMaskImageLayersFixture(
	'token-url',
	false,
);

export const maskImageLayerSources = [
	'data',
	'url',
	'blob',
	'token-url',
] as const;

// All sources side by side in one 2x2 grid of 200x136 panels, so one native
// capture and one render cover every source.
export const createMaskImageLayersGridFixture = (opaque: boolean) => {
	const panels = maskImageLayerSources.map((source) =>
		createMaskImageLayersFixture(source, opaque),
	);
	const Component = () => (
		<AbsoluteFill>
			{panels.map((panel, index) => (
				<div
					key={panel.id}
					style={{
						position: 'absolute',
						left: (index % 2) * panel.width,
						top: Math.floor(index / 2) * panel.height,
						width: panel.width,
						height: panel.height,
					}}
				>
					<panel.component />
				</div>
			))}
		</AbsoluteFill>
	);

	return {
		component: Component,
		id: `mask-image-layers-grid-${opaque ? 'opaque' : 'transparent'}`,
		width: 400,
		height: 272,
		fps: 25,
		durationInFrames: 2,
	} as const;
};
