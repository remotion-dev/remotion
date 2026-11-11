import {loadFont} from '@remotion/fonts';
import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {AbsoluteFill, useCurrentFrame, useDelayRender} from 'remotion';
import {svgExternalFontReady} from './svg-external-font-selection';

export const svgInactiveTitleModes = [
	'empty-preferred',
	'empty-preferred-inactive',
	'empty-preferred-disabled',
	'empty-preferred-multiple',
	'inactive',
	'multiple-inactive',
	'preferred-inactive',
	'structural',
	'active-preferred',
	'local-conflict',
	'unicode',
	'empty',
	'disabled',
	'large',
	'media-active',
	'media-inactive',
	'media-value',
	'media-alias',
] as const;
const bangers = new URL(
	'../../../../example/public/bangers.woff2',
	import.meta.url,
).href;
const roboto = new URL(
	'../../../../example/public/Roboto-Medium.ttf',
	import.meta.url,
).href;
let unicodeReady: Promise<unknown> | null = null;
let largeReady: Promise<unknown> | null = null;
export const svgInactiveTitleReady = (
	mode: (typeof svgInactiveTitleModes)[number],
) => {
	if (mode === 'unicode') {
		unicodeReady ??= loadFont({
			family: 'Titled 字体 🙂',
			url: bangers,
			format: 'woff2',
		});
		return unicodeReady;
	}

	if (mode === 'large') {
		largeReady ??= (async () => {
			const original = await (await fetch(roboto)).arrayBuffer();
			const padded = new Uint8Array(original.byteLength + 3 * 1024 * 1024);
			padded.set(new Uint8Array(original));
			const url = URL.createObjectURL(new Blob([padded], {type: 'font/ttf'}));
			try {
				return await loadFont({
					family: 'Large titled font',
					url,
					format: 'truetype',
				});
			} finally {
				URL.revokeObjectURL(url);
			}
		})();
		return largeReady;
	}

	return svgExternalFontReady;
};

const localData = fetch(roboto)
	.then((r) => r.blob())
	.then(
		(blob) =>
			new Promise<string>((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = () => resolve(reader.result as string);
				reader.onerror = () => reject(reader.error);
				reader.readAsDataURL(blob);
			}),
	);
export const svgInactiveTitledFont = ({
	mode,
	literal,
	fallback,
}: {
	mode: (typeof svgInactiveTitleModes)[number];
	literal: boolean;
	fallback: boolean;
}) => {
	const Fixture = () => {
		const frame = useCurrentFrame();
		const emptyPreferred = mode.startsWith('empty-preferred');
		const first = useRef<HTMLStyleElement>(null);
		const {delayRender, continueRender, cancelRender} = useDelayRender();
		const [handle] = useState(() =>
			delayRender('Loading inactive titled font'),
		);
		const [data, setData] = useState<string | null>(null);
		const family =
			mode === 'unicode'
				? 'Titled 字体 🙂'
				: mode === 'large'
					? 'Large titled font'
					: 'External SVG, class font';
		useEffect(() => {
			let active = true;
			Promise.all([svgInactiveTitleReady(mode), localData])
				.then(([, font]) => {
					if (active) {
						setData(font);
					}
				})
				.catch((error) => {
					if (active) cancelRender(error);
				});
			return () => {
				active = false;
				continueRender(handle);
			};
		}, [handle, continueRender, cancelRender]);
		useLayoutEffect(() => {
			if (data) continueRender(handle);
		}, [data, handle, continueRender]);
		useLayoutEffect(() => {
			const sheet = first.current?.sheet;
			if (
				(mode !== 'disabled' && mode !== 'empty-preferred-disabled') ||
				!sheet
			)
				return;
			sheet.disabled = true;
			return () => {
				sheet.disabled = false;
			};
		}, [data]);
		if (!data) return null;
		const guard =
			mode === 'structural' ||
			mode === 'active-preferred' ||
			mode === 'media-value' ||
			mode === 'media-alias';
		const titled = !literal || guard;
		const firstMedia =
			mode === 'media-active'
				? '(min-width: 500px)'
				: mode === 'media-inactive'
					? '(max-width: 500px)'
					: mode === 'active-preferred' ||
						  mode === 'disabled' ||
						  mode === 'empty' ||
						  (emptyPreferred && mode !== 'empty-preferred-inactive')
						? 'all'
						: 'not all';
		const firstPaint =
			mode === 'active-preferred'
				? 'style[title="b"][media] + text + rect{fill:#1373ab} rect:last-child{fill:green}'
				: 'rect{fill:red}';
		return (
			<AbsoluteFill style={{backgroundColor: 'white'}}>
				<svg
					width={340}
					height={120}
					data-remotion-authored-media={
						mode === 'media-alias' ? 'authored collision' : undefined
					}
				>
					{mode === 'structural' ||
					mode === 'media-value' ||
					mode === 'media-alias' ? (
						<style>
							{mode === 'media-value' || mode === 'media-alias'
								? 'style[media="not all"] + text + rect{fill:#1373ab} style:not([media="all"]) + text ~ rect:last-child{fill:green} [data-remotion-authored-media]{--authored-alias:1}'
								: 'rect:nth-child(4){fill:#1373ab} rect:last-child{fill:green} style[title="a"][media] + text + rect{stroke:#1373ab;stroke-width:2}'}
						</style>
					) : null}
					{mode === 'local-conflict' ? (
						<style>{`@font-face{font-family:${JSON.stringify(family)};src:url("${data}") format("truetype")}`}</style>
					) : null}
					<style
						ref={first}
						title={titled ? 'a' : undefined}
						media={firstMedia}
					>
						{mode === 'empty' || emptyPreferred ? '' : firstPaint}
					</style>
					{mode === 'empty-preferred-multiple'
						? Array.from({length: 32}, (_, index) => (
								<style key={index} title={titled ? 'a' : undefined} />
							))
						: null}
					{emptyPreferred ||
					mode === 'multiple-inactive' ||
					mode === 'preferred-inactive' ||
					mode === 'active-preferred' ? (
						<style
							title={titled ? 'b' : undefined}
							media={
								emptyPreferred || (mode === 'preferred-inactive' && !literal)
									? 'all'
									: 'not all'
							}
						>
							{emptyPreferred ? '/* Other titled set. */' : 'rect{fill:red}'}
						</style>
					) : null}
					<text
						x={8}
						y={48}
						style={{
							fontFamily: fallback ? 'monospace' : JSON.stringify(family),
							fontSize: 32 + frame,
						}}
					>
						Titled carrier font
					</text>
					<rect
						x={10}
						y={70}
						width={120}
						height={20}
						fill={guard ? 'red' : '#1373ab'}
					/>
					<rect
						x={160}
						y={70}
						width={120}
						height={20}
						fill={guard ? 'red' : 'green'}
					/>
				</svg>
			</AbsoluteFill>
		);
	};

	return {
		component: Fixture,
		id: `svg-inactive-title-${mode}${literal ? '-literal' : ''}${fallback ? '-fallback' : ''}`,
		width: 340,
		height: 120,
		fps: 30,
		durationInFrames: 2,
	} as const;
};

export const svgInactiveTitleMediaCache = ({
	active,
}: {
	active: boolean | null;
}) => {
	const Component = () => (
		<svg width={100} height={60}>
			<rect width={100} height={60} fill="white" />
			<style title="a" media={active === null ? '(min-width: 500px)' : 'all'}>
				{active === false ? 'rect.marker{fill:blue}' : 'rect.marker{fill:red}'}
			</style>
			<style title="b" media="all">
				{'rect.secondary{fill:green}'}
			</style>
			<text style={{fontFamily: '"External SVG, class font"', fontSize: 0}}>
				Cache
			</text>
			<rect
				className="marker"
				x={10}
				y={10}
				width={70}
				height={40}
				fill="blue"
			/>
		</svg>
	);
	return {
		component: Component,
		id: `svg-inactive-title-media-cache-${active === null ? 'query' : active ? 'active' : 'inactive'}`,
		width: 100,
		height: 60,
		fps: 30,
		durationInFrames: 1,
	} as const;
};
