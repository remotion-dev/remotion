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
const otherFontUrl = new URL(
	'../../../example/public/Roboto-Medium.ttf',
	import.meta.url,
).href;

type Variant = 'text' | 'link' | 'use' | 'filter' | 'local-style';

type SvgTextProps = {
	fontFamily: string;
	dominantBaseline: 'auto' | 'central';
	variant: Variant;
	localCss: string;
	fontWeight: number;
};

const SvgText: React.FC<SvgTextProps> = ({
	fontFamily,
	dominantBaseline,
	variant,
	localCss,
	fontWeight,
}) => {
	const text = (
		<text
			id={variant === 'use' ? 'template' : undefined}
			x={0}
			y={dominantBaseline === 'central' ? 30 : 46}
			fontSize={42}
			dominantBaseline={dominantBaseline}
			style={{fontFamily, fontWeight}}
		>
			Hamburgefonstiv
		</text>
	);

	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<svg viewBox="0 0 360 60" width={360} height={60}>
				{variant === 'local-style' ? <style>{localCss}</style> : null}
				{variant === 'filter' ? (
					<filter id="shift">
						<feOffset dx={0} dy={0} />
					</filter>
				) : null}
				{variant === 'link' ? <a href="#target">{text}</a> : null}
				{variant === 'use' ? (
					<>
						<defs>{text}</defs>
						<use href="#template" />
					</>
				) : null}
				{variant === 'filter' ? <g filter="url(#shift)">{text}</g> : null}
				{variant === 'text' || variant === 'local-style' ? text : null}
			</svg>
		</AbsoluteFill>
	);
};

const render = async ({
	fontFamily,
	dominantBaseline = 'auto',
	variant = 'text',
	localCss = '',
	fontWeight = 400,
}: {
	fontFamily: string;
	dominantBaseline?: SvgTextProps['dominantBaseline'];
	variant?: Variant;
	localCss?: string;
	fontWeight?: number;
}) => {
	const inputProps: SvgTextProps = {
		fontFamily,
		dominantBaseline,
		variant,
		localCss,
		fontWeight,
	};
	const {blob} = await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: {
			component: SvgText,
			id: 'svg-css-font',
			width: 360,
			height: 60,
			fps: 30,
			durationInFrames: 1,
			defaultProps: inputProps,
		},
		frame: 0,
		inputProps,
	});
	return blob({format: 'png'});
};

const registeredFamily = "'Registered Bangers', serif";
let fallback: Blob;
let fontDataUrl: string;

beforeAll(async () => {
	await loadFont({family: 'Registered Bangers', url: fontUrl});
	fallback = await render({fontFamily: 'serif'});
	const bytes = new Uint8Array(await (await fetch(fontUrl)).arrayBuffer());
	let binary = '';
	for (const byte of bytes) binary += String.fromCharCode(byte);
	fontDataUrl = `data:font/woff2;base64,${btoa(binary)}`;
});

const cleanups: (() => void)[] = [];
afterEach(() => {
	cleanups.splice(0).forEach((cleanup) => cleanup());
});

const addStyle = async (css: string, title: string | null = null) => {
	const style = document.createElement('style');
	style.textContent = css;
	if (title !== null) {
		style.title = title;
	}

	const loaded = new Promise((resolve) => {
		style.onload = resolve;
	});
	document.head.appendChild(style);
	cleanups.push(() => style.remove());
	await loaded;
};

const fontFace = (family: string, src: string) =>
	`@font-face { font-family: '${family}'; src: url("${src}") format('woff2'); }`;

const expectSameAsRegistered = async (
	family: string,
	variant: Variant = 'text',
	localCss = '',
) => {
	const expected = await render({fontFamily: registeredFamily, variant});
	const actual = await render({
		fontFamily: `'${family}', serif`,
		variant,
		localCss,
	});
	expect((await countNativePixels(expected, actual)).mismatchedPixels).toBe(0);
};

test('the registered font and the fallback render differently', async () => {
	const registered = await render({fontFamily: registeredFamily});
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
	const actual = await render({fontFamily: "'Css Inactive Bangers', serif"});
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

test('SVG text keeps the fallback for a font in an alternate stylesheet set', async () => {
	await addStyle('', 'Preferred');
	await addStyle(fontFace('Css Alternate Bangers', fontUrl), 'Alternate');
	const actual = await render({fontFamily: "'Css Alternate Bangers', serif"});
	expect((await countNativePixels(fallback, actual)).mismatchedPixels).toBe(0);
});

test('SVG text uses a font from the preferred stylesheet set', async () => {
	await addStyle(fontFace('Css Preferred Bangers', fontUrl), 'Preferred');
	await expectSameAsRegistered('Css Preferred Bangers');
});

test('SVG text uses a URL font declared in the SVG’s own <style>', async () => {
	await expectSameAsRegistered(
		'Css Local Bangers',
		'local-style',
		fontFace('Css Local Bangers', fontUrl),
	);
});

test.for(['link', 'use', 'filter'] as const)(
	'SVG text inside %s uses a CSS @font-face font',
	async (variant) => {
		await addStyle(fontFace(`Css ${variant} Bangers`, fontUrl));
		await expectSameAsRegistered(`Css ${variant} Bangers`, variant);
	},
);

test('an inactive @media rule with the same descriptors does not replace the active font', async () => {
	await addStyle(
		`${fontFace('Css Collision Bangers', fontUrl)} @media (max-width: 1px) { ${fontFace('Css Collision Bangers', otherFontUrl)} }`,
	);
	await expectSameAsRegistered('Css Collision Bangers');
});

test('the later of two matching @font-face rules wins', async () => {
	await addStyle(
		`${fontFace('Css Order Bangers', otherFontUrl)} ${fontFace('Css Order Bangers', fontUrl)}`,
	);
	await expectSameAsRegistered('Css Order Bangers');
});

test('a font loads from a later src URL when the first one fails', async () => {
	await addStyle(
		`@font-face { font-family: 'Css Fallback Bangers'; src: url("${new URL('/missing-font.woff2', fontUrl).href}") format('woff2'), url("${fontUrl}") format('woff2'); }`,
	);
	await expectSameAsRegistered('Css Fallback Bangers');
});

test('a descriptor changed through the CSSOM applies to the next render', async (t) => {
	// WebKit does not support ascent-override.
	if (t.task.file.projectName === 'webkit') {
		t.skip();
		return;
	}

	const withAscent = (family: string, ascent: string) =>
		`@font-face { font-family: '${family}'; src: url("${fontUrl}") format('woff2'); ascent-override: ${ascent}; }`;
	await addStyle(
		`${withAscent('Css Mutated Bangers', '90%')} ${withAscent('Css Fresh Bangers', '10%')}`,
	);
	const central = (fontFamily: string) =>
		render({fontFamily, dominantBaseline: 'central'});
	const before = await central("'Css Mutated Bangers', serif");
	const sheet = Array.from(document.styleSheets).find((candidate) =>
		Array.from(candidate.cssRules).some((rule) =>
			rule.cssText.includes('Css Mutated Bangers'),
		),
	)!;
	sheet.deleteRule(0);
	sheet.insertRule(withAscent('Css Mutated Bangers', '10%'), 0);
	const after = await central("'Css Mutated Bangers', serif");
	const fresh = await central("'Css Fresh Bangers', serif");

	expect(
		(await countNativePixels(before, after)).mismatchedPixels,
	).toBeGreaterThan(0);
	expect((await countNativePixels(fresh, after)).mismatchedPixels).toBe(0);
});

test('a family with both a loadFont() face and a CSS @font-face face uses both', async () => {
	await loadFont({family: 'Mixed Bangers', url: fontUrl, weight: '400'});
	const weighted = (family: string, url: string, weight: number) =>
		`@font-face { font-family: '${family}'; src: url("${url}"); font-weight: ${weight}; }`;
	await addStyle(
		`${weighted('Mixed Bangers', otherFontUrl, 700)} ${weighted('Css Only Mixed', fontUrl, 400)} ${weighted('Css Only Mixed', otherFontUrl, 700)}`,
	);

	for (const fontWeight of [400, 700]) {
		const expected = await render({
			fontFamily: "'Css Only Mixed', serif",
			fontWeight,
		});
		const actual = await render({
			fontFamily: "'Mixed Bangers', serif",
			fontWeight,
		});
		expect((await countNativePixels(expected, actual)).mismatchedPixels).toBe(
			0,
		);
	}
});
