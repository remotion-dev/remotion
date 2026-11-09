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
	source: 'data' | 'url' | 'blob',
	opaque: boolean,
	variant: {id: string; styles: readonly React.CSSProperties[]} | null,
) => {
	const cases = variant?.styles ?? [...styles, ...partialStyles];
	const rows = Math.ceil(cases.length / 4);
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
					: source === 'url'
						? [
								staticFile('mask-alpha)tile.png'),
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
					gridTemplateRows: `repeat(${rows}, 24px)`,
					padding: 8,
					gap: 8,
				}}
			>
				<Img src={sources[0]} style={{display: 'none'}} />
				<Img src={sources[1]} style={{display: 'none'}} />
				{cases.map((style) => (
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
		id: `${variant?.id ?? 'mask-image-layers'}-${source}-${opaque ? 'opaque' : 'transparent'}`,
		width: 200,
		height: rows * 32 + 8,
		fps: 25,
		durationInFrames: 2,
	} as const;
};

export const maskImageLayers = createMaskImageLayersFixture('data', true, null);
export const maskImageLayersTransparent = createMaskImageLayersFixture(
	'data',
	false,
	null,
);
export const maskImageLayersUrl = createMaskImageLayersFixture(
	'url',
	true,
	null,
);
export const maskImageLayersUrlTransparent = createMaskImageLayersFixture(
	'url',
	false,
	null,
);
export const maskImageLayersBlob = createMaskImageLayersFixture(
	'blob',
	true,
	null,
);
export const maskImageLayersBlobTransparent = createMaskImageLayersFixture(
	'blob',
	false,
	null,
);
