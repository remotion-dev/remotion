import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {AbsoluteFill, useDelayRender} from 'remotion';

const sources = Promise.all(
	[
		new URL('../../../../example/public/bangers.woff2', import.meta.url).href,
		new URL('../../../../example/public/Roboto-Medium.ttf', import.meta.url)
			.href,
	].map(async (url) => {
		const blob = await (await fetch(url)).blob();
		return new Promise<string>((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = () => reject(reader.error);
			reader.readAsDataURL(blob);
		});
	}),
);

export const persistentOrderModes = [
	'external-last',
	'external-first',
	'two-local-last',
	'import-last',
] as const;

export const svgTitledPersistentOrder = (
	mode: (typeof persistentOrderModes)[number],
	firstRoboto: boolean,
	literal: boolean,
) => {
	const Component = () => {
		const {delayRender, continueRender, cancelRender} = useDelayRender();
		const [handle] = useState(() =>
			delayRender('Loading persistent font order'),
		);
		const [data, setData] = useState<string[] | null>(null);
		const [importLoaded, setImportLoaded] = useState(
			mode !== 'import-last' || literal,
		);
		const family = `Persistent order ${mode} ${firstRoboto ? 'Roboto' : 'Bangers'}`;
		const importedStyle = useRef<HTMLStyleElement>(null);
		useLayoutEffect(() => {
			const style = importedStyle.current;
			if (style === null) return;
			const ready = () => {
				const rule = style.sheet?.cssRules[0];
				if (rule instanceof CSSImportRule && rule.styleSheet?.cssRules.length) {
					setImportLoaded(true);
				}
			};

			style.addEventListener('load', ready);
			ready();
			return () => style.removeEventListener('load', ready);
		}, [data]);
		useEffect(() => {
			let active = true;
			sources
				.then((value) => {
					if (active) setData(value);
				})
				.catch((error) => {
					if (active) cancelRender(error);
				});
			return () => {
				active = false;
				continueRender(handle);
			};
		}, [cancelRender, continueRender, handle]);
		useEffect(() => {
			if (data === null || !importLoaded) return;
			let active = true;
			document.fonts
				.load(`40px "${family}"`)
				.then((faces) => {
					if (faces.length === 0)
						throw new Error('Persistent font was not available');
					if (active) continueRender(handle);
				})
				.catch((error) => {
					if (active) cancelRender(error);
				});
			return () => {
				active = false;
			};
		}, [cancelRender, continueRender, data, family, handle, importLoaded]);
		if (data === null) return null;
		const preferred = data[firstRoboto ? 1 : 0];
		const middle = data[firstRoboto ? 0 : 1];
		const face = (url: string) =>
			`@font-face{font-family:"${family}";src:url("${url}")}`;
		const final = mode === 'external-first' ? middle : preferred;
		return (
			<AbsoluteFill style={{backgroundColor: 'white'}}>
				{mode === 'external-first' && !literal ? (
					<style>{face(middle)}</style>
				) : null}
				<svg width={320} height={100}>
					<style title={literal ? undefined : 'persistent-a'}>
						{`${face(literal ? final : preferred)} rect{fill:lime}`}
					</style>
					{literal ? null : (
						<style title="persistent-b">{`${face(middle)} rect{fill:red}`}</style>
					)}
					{literal ? null : mode === 'import-last' ? (
						<style
							ref={importedStyle}
						>{`@import url("data:text/css,${encodeURIComponent(face(middle))}");`}</style>
					) : (
						<style>{face(middle)}</style>
					)}
					{mode === 'two-local-last' && !literal ? (
						<style>{face(middle)}</style>
					) : null}
					<text x={8} y={60} fontFamily={family} fontSize={40} fill="black">
						Title Font
					</text>
					<rect x={290} y={80} width={20} height={10} />
				</svg>
				{mode !== 'external-first' && !literal ? (
					<style>{face(preferred)}</style>
				) : null}
			</AbsoluteFill>
		);
	};

	return {
		component: Component,
		id: `svg-persistent-order-${mode}-${firstRoboto ? 'roboto' : 'bangers'}-${literal ? 'literal' : 'authored'}`,
		width: 320,
		height: 100,
		durationInFrames: 1,
		fps: 30,
	} as const;
};
