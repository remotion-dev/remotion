import {loadFont} from '@remotion/fonts';
import {AbsoluteFill} from 'remotion';
import {afterEach, beforeAll, expect, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {countNativePixels} from './native-reference';

const fontUrl = new URL(
	'../../../example/public/bangers.woff2',
	import.meta.url,
).href;

const SvgText: React.FC<{fontFamily: string}> = ({fontFamily}) => {
	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<svg viewBox="0 0 360 60" width={360} height={60}>
				<text x={0} y={46} fontSize={42} style={{fontFamily}}>
					Hamburgefonstiv
				</text>
			</svg>
		</AbsoluteFill>
	);
};

const render = async (fontFamily: string) => {
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: {
			component: SvgText,
			id: 'svg-css-font',
			width: 360,
			height: 60,
			fps: 30,
			durationInFrames: 1,
			defaultProps: {fontFamily: 'serif'},
		},
		frame: 0,
		inputProps: {fontFamily},
	});
	return blob({format: 'png'});
};

let registered: Blob;
let fallback: Blob;
let fontDataUrl: string;

beforeAll(async () => {
	await loadFont({family: 'Registered Bangers', url: fontUrl});
	registered = await render("'Registered Bangers', serif");
	fallback = await render('serif');
	const bytes = new Uint8Array(await (await fetch(fontUrl)).arrayBuffer());
	let binary = '';
	for (const byte of bytes) binary += String.fromCharCode(byte);
	fontDataUrl = `data:font/woff2;base64,${btoa(binary)}`;
});

const cleanups: (() => void)[] = [];
afterEach(() => {
	cleanups.splice(0).forEach((cleanup) => cleanup());
});

const addStyle = async (css: string) => {
	const style = document.createElement('style');
	style.textContent = css;
	const loaded = new Promise((resolve) => {
		style.onload = resolve;
	});
	document.head.appendChild(style);
	cleanups.push(() => style.remove());
	await loaded;
};

const fontFace = (family: string, src: string) =>
	`@font-face { font-family: '${family}'; src: url("${src}") format('woff2'); }`;

const expectSameAsRegistered = async (family: string) => {
	const actual = await render(`'${family}', serif`);
	expect((await countNativePixels(registered, actual)).mismatchedPixels).toBe(
		0,
	);
};

test('the registered font and the fallback render differently', async () => {
	expect(
		(await countNativePixels(registered, fallback)).mismatchedPixels,
	).toBeGreaterThan(0);
});

test('SVG text uses a font from a CSS @font-face URL', async () => {
	await addStyle(fontFace('Css Url Bangers', fontUrl));
	await expectSameAsRegistered('Css Url Bangers');
});

test('SVG text uses a font from a CSS @font-face data URL', async () => {
	await addStyle(fontFace('Css Data Bangers', fontDataUrl));
	await expectSameAsRegistered('Css Data Bangers');
});

test('SVG text uses a font declared inside matching @media and @supports', async () => {
	await addStyle(
		`@media all { @supports (display: grid) { ${fontFace('Css Conditional Bangers', fontUrl)} } }`,
	);
	await expectSameAsRegistered('Css Conditional Bangers');
});

test('SVG text keeps the fallback for a font inside a non-matching @media', async () => {
	await addStyle(
		`@media (max-width: 1px) { ${fontFace('Css Inactive Bangers', fontUrl)} }`,
	);
	const actual = await render("'Css Inactive Bangers', serif");
	expect((await countNativePixels(fallback, actual)).mismatchedPixels).toBe(0);
});

test('SVG text uses a font from an @import-ed stylesheet', async () => {
	const imported = URL.createObjectURL(
		new Blob([fontFace('Css Import Bangers', fontUrl)], {type: 'text/css'}),
	);
	cleanups.push(() => URL.revokeObjectURL(imported));
	await addStyle(`@import url("${imported}");`);
	await expectSameAsRegistered('Css Import Bangers');
});

test('SVG text uses a font from an adopted stylesheet', async () => {
	const sheet = new CSSStyleSheet();
	sheet.replaceSync(fontFace('Css Adopted Bangers', fontUrl));
	const previous = document.adoptedStyleSheets;
	document.adoptedStyleSheets = [...previous, sheet];
	cleanups.push(() => {
		document.adoptedStyleSheets = previous;
	});
	await expectSameAsRegistered('Css Adopted Bangers');
});
