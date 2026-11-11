import {expect, test} from 'vitest';
import {server} from 'vitest/browser';
import '../symbol-dispose';
import {getSvgPaintBounds} from '../drawing/get-svg-paint-bounds';
import {renderStillOnWeb} from '../render-still-on-web';
import {svgExternalFontReady} from './fixtures/svg-external-font-selection';
import {svgPrecomposeFont} from './fixtures/svg-precompose-font';
import {captureNativeReference, compareNativePixels} from './native-reference';

test.for(['registered', 'import'] as const)(
	'checks original SVG paint bounds against blend rasterization $0',
	async (source, t) => {
		await svgExternalFontReady;
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('width', '320');
		svg.setAttribute('height', '100');
		svg.style.mixBlendMode = 'multiply';
		svg.innerHTML =
			'<text x="12" y="62" style="font-family:&quot;External SVG, class font&quot;;font-size:43px;-webkit-text-stroke:3px #1373ab">SVG font capture</text>';
		document.body.appendChild(svg);
		const mapped = getSvgPaintBounds(svg);
		const matrix = svg.getScreenCTM();
		const styles = [svg, ...svg.querySelectorAll('*')].map((element) => {
			const style = getComputedStyle(element);
			return {
				tag: element.tagName,
				mixBlendMode: style.mixBlendMode,
				backgroundColor: style.backgroundColor,
				backgroundImage: style.backgroundImage,
				maskImage: style.maskImage,
				stroke: style.stroke,
				strokeWidth: style.strokeWidth,
				webkitTextStrokeWidth: style.getPropertyValue(
					'-webkit-text-stroke-width',
				),
				textShadow: style.textShadow,
				textDecorationLine: style.textDecorationLine,
				strokeOpacity: style.strokeOpacity,
				markerStart: style.markerStart,
				markerMid: style.markerMid,
				markerEnd: style.markerEnd,
				filter: style.filter,
				boxShadow: style.boxShadow,
				clipPath: style.clipPath,
				outlineStyle: style.outlineStyle,
				outlineWidth: style.outlineWidth,
				borders: ['top', 'right', 'bottom', 'left'].map((side) => [
					style.getPropertyValue(`border-${side}-width`),
					style.getPropertyValue(`border-${side}-style`),
				]),
			};
		});
		await server.commands.writeFile(
			`validation/svg-precompose-font-clip-probe/${server.browser}/${source}-guard.json`,
			JSON.stringify(
				{
					mapped,
					matrix: matrix
						? {
								name: matrix.constructor.name,
								is2D: matrix.is2D,
								a: matrix.a,
								b: matrix.b,
								c: matrix.c,
								d: matrix.d,
								e: matrix.e,
								f: matrix.f,
							}
						: null,
					styles,
				},
				null,
				2,
			),
			'utf8',
		);
		const box = svg.getBBox();
		const rect = {
			left: Math.floor(box.x),
			top: Math.floor(box.y),
			right: Math.ceil(box.x + box.width),
			bottom: Math.ceil(box.y + box.height),
		};
		svg.remove();
		const base = svgPrecomposeFont({
			source,
			effect: 'blend',
			literal: true,
			fontStep: null,
			paint: null,
		});
		const Component = base.component;
		const ClippedComponent = () => (
			<>
				<style>{`.svg-precompose-blend {clip-path:inset(${rect.top}px ${320 - rect.right}px ${100 - rect.bottom}px ${rect.left}px)}`}</style>
				<Component />
			</>
		);
		const clipped = {
			...base,
			id: base.id + '-bbox-clipped',
			component: ClippedComponent,
		};
		const isolation = svgPrecomposeFont({
			source,
			effect: 'isolation',
			literal: true,
			fontStep: null,
			paint: null,
		});
		const none = svgPrecomposeFont({
			source,
			effect: 'none',
			literal: true,
			fontStep: null,
			paint: null,
		});
		const native = await captureNativeReference(base, 1, {
			omitBackground: false,
		});
		const nativeClipped = await captureNativeReference(clipped, 1, {
			omitBackground: false,
		});
		const nativeIsolation = await captureNativeReference(isolation, 1, {
			omitBackground: false,
		});
		const nativeNone = await captureNativeReference(none, 1, {
			omitBackground: false,
		});
		const render = async (
			composition: Omit<typeof base, 'id'> & {id: string},
		) =>
			(
				await renderStillOnWeb({
					composition,
					frame: 1,
					inputProps: {},
					licenseKey: 'free-license',
					allowHtmlInCanvas: false,
				})
			).blob({format: 'png'});
		const actual = await render(base);
		const actualClipped = await render(clipped);
		for (const [name, blob] of [
			['native', native],
			['native-clipped', nativeClipped],
			['native-isolation', nativeIsolation],
			['native-none', nativeNone],
			['actual', actual],
			['actual-clipped', actualClipped],
		] as const) {
			let binary = '';
			for (const byte of new Uint8Array(await blob.arrayBuffer()))
				binary += String.fromCharCode(byte);
			await server.commands.writeFile(
				`validation/svg-precompose-font-clip-probe/${server.browser}/${source}-${name}.png`,
				btoa(binary),
				'base64',
			);
		}

		await server.commands.writeFile(
			`validation/svg-precompose-font-clip-probe/${server.browser}/${source}-rect.json`,
			JSON.stringify(rect, null, 2),
			'utf8',
		);
		expect(
			(await compareNativePixels(native, nativeClipped)).mismatchedPixels,
		).toBe(0);
		if (t.task.file.projectName === 'chromium')
			expect(
				(await compareNativePixels(native, actualClipped)).mismatchedPixels,
			).toBe(0);
	},
);
