import {NoReactInternals} from 'remotion/no-react';
import {
	getBase64,
	getEmbeddedFontStyleForSvg,
} from './embed-registered-fonts-in-svg';

const textFontProperties = [
	'font-family',
	'font-size',
	'font-style',
	'font-weight',
	'font-stretch',
] as const;

const getReferencedTemplates = (svg: SVGSVGElement) => {
	const documentUrl = new URL(svg.ownerDocument.URL);
	documentUrl.hash = '';
	const templates = new Set<Element>();
	for (const use of svg.querySelectorAll('use')) {
		try {
			const url = new URL(use.href.baseVal, use.baseURI);
			const id = decodeURIComponent(url.hash.slice(1));
			url.hash = '';
			if (url.href !== documentUrl.href) continue;
			const template = svg.getElementById(id);
			if (template) templates.add(template);
		} catch {
			// Invalid authored references do not instantiate a template.
			continue;
		}
	}

	return templates;
};

type CssFontRule = {
	css: string;
	url: string | null;
	declarations: [string, string][];
};

// Evaluate conditional rules before SVG image loading changes the viewport.
const getActiveCssRules = (
	cssRules: CSSRuleList,
	ownerWindow: Window & typeof globalThis,
): CSSRule[] => {
	const activeRules: CSSRule[] = [];
	for (const rule of cssRules) {
		if (rule instanceof ownerWindow.CSSMediaRule) {
			if (ownerWindow.matchMedia(rule.conditionText).matches)
				activeRules.push(...getActiveCssRules(rule.cssRules, ownerWindow));
		} else if (rule instanceof ownerWindow.CSSSupportsRule) {
			if (ownerWindow.CSS.supports(rule.conditionText))
				activeRules.push(...getActiveCssRules(rule.cssRules, ownerWindow));
		} else {
			activeRules.push(rule);
		}
	}

	return activeRules;
};

// Font sources must be self-contained before the SVG is loaded as an image.
const getCssFontRules = (svg: SVGSVGElement, fontFamilies: Set<string>) => {
	const rules: CssFontRule[] = [];
	const ownerWindow = svg.ownerDocument.defaultView! as Window &
		typeof globalThis;
	const visitRules = (cssRules: CSSRuleList, baseUrl: string) => {
		for (const rule of getActiveCssRules(cssRules, ownerWindow)) {
			if (!(rule instanceof ownerWindow.CSSFontFaceRule)) continue;
			const family = rule.style.fontFamily
				.replace(/^(['"])(.*)\1$/, '$2')
				.toLowerCase();
			if (!fontFamilies.has(family)) continue;
			const src = rule.style.getPropertyValue('src');
			// Multiple sources and CSS-escaped URLs need separate source selection.
			const source =
				/^url\((?:"([^"\\]*)"|'([^'\\]*)'|([^()\\]*))\)(?:\s+format\([^)]*\))?$/i.exec(
					src,
				);
			if (!source) continue;
			const sourceUrl = source[1] ?? source[2] ?? source[3];
			let url: string | null = null;
			if (!/^data:/i.test(sourceUrl)) {
				let resolved: URL;
				try {
					resolved = new URL(sourceUrl, baseUrl);
				} catch {
					// Invalid authored font URLs retain the browser's fallback behavior.
					continue;
				}

				// FontFace exposes no source URL. Limit this slice to a unique loaded
				// face, so an unused or failed CSS source is not fetched for export.
				const faces = Array.from(svg.ownerDocument.fonts).filter(
					(face) =>
						face.family.replace(/^(['"])(.*)\1$/, '$2').toLowerCase() ===
						family,
				);
				if (faces.length !== 1 || faces[0].status !== 'loaded') continue;
				if (
					resolved.origin !== new URL(svg.ownerDocument.URL).origin ||
					!['http:', 'https:'].includes(resolved.protocol) ||
					resolved.hash
				)
					continue;
				url = resolved.href;
			}

			rules.push({
				css: rule.cssText,
				url,
				declarations: Array.from(rule.style, (name) => [
					name,
					rule.style.getPropertyValue(name),
				]),
			});
		}
	};

	for (const sheet of svg.ownerDocument.styleSheets) {
		if (
			sheet.disabled ||
			(sheet.media.mediaText &&
				!ownerWindow.matchMedia(sheet.media.mediaText).matches)
		)
			continue;
		let cssRules: CSSRuleList;
		try {
			cssRules = sheet.cssRules;
		} catch (error) {
			if (error instanceof DOMException && error.name === 'SecurityError')
				continue;
			throw error;
		}

		visitRules(cssRules, sheet.href ?? svg.baseURI);
	}

	return rules;
};

const drawableBySvg = new WeakMap<
	SVGSVGElement,
	{
		fontStyleKey: string | null;
		serializedSvg: string;
		drawable: Promise<HTMLImageElement>;
	}
>();

export const turnSvgIntoDrawable = (svg: SVGSVGElement) => {
	const {fill, color, width, height} = getComputedStyle(svg);
	const textElements = Array.from(
		svg.querySelectorAll('text, tspan, textPath'),
	);
	const referencedTemplates = textElements.length
		? getReferencedTemplates(svg)
		: new Set<Element>();
	const textStyles = textElements.map((element) => {
		// Templates inherit font selection from each <use> instance.
		if (element.closest('defs, symbol')) return null;
		let ancestor: Element = element;
		while (ancestor !== svg) {
			if (referencedTemplates.has(ancestor)) return null;
			ancestor = ancestor.parentElement!;
		}

		const style = getComputedStyle(element);
		return textFontProperties.map((property) =>
			style.getPropertyValue(property),
		);
	});

	const originalStyle = svg.getAttribute('style');
	const originalWidth = svg.getAttribute('width');
	const originalHeight = svg.getAttribute('height');
	const needsExplicitDimensions =
		svg.preserveAspectRatio.baseVal.align ===
		SVGPreserveAspectRatio.SVG_PRESERVEASPECTRATIO_NONE;

	// SVG images need explicit dimensions to preserve their viewport when
	// preserveAspectRatio="none" removes the intrinsic aspect ratio.
	if (needsExplicitDimensions) {
		svg.setAttribute('width', width);
		svg.setAttribute('height', height);
	}

	// Position and transforms are applied by the canvas renderer. Remove them
	// from the serialized SVG so they are not applied again inside its viewport.
	svg.style.position = 'static';
	svg.style.inset = 'auto';
	svg.style.transform = 'none';
	svg.style.translate = 'none';
	svg.style.scale = 'none';
	svg.style.rotate = 'none';
	svg.style.transformOrigin = '';
	// Margins were already included in the positioning calculation,
	// so we need to remove them to avoid double counting.
	svg.style.marginLeft = '0';
	svg.style.marginRight = '0';
	svg.style.marginTop = '0';
	svg.style.marginBottom = '0';
	svg.style.fill = fill;
	svg.style.color = color;
	// External stylesheet rules disappear when the SVG becomes an image.
	// Preserve resolved font selection without mutating mounted text elements.
	const svgForSerialization =
		textStyles.length === 0 ? svg : (svg.cloneNode(true) as SVGSVGElement);
	svgForSerialization
		.querySelectorAll<SVGTextContentElement>('text, tspan, textPath')
		.forEach((element, index) => {
			const fontStyle = textStyles[index];
			if (fontStyle === null) return;
			textFontProperties.forEach((property, propertyIndex) => {
				element.style.setProperty(
					property,
					fontStyle[propertyIndex],
					'important',
				);
			});
		});
	const fontFamilies = new Set(
		textStyles.flatMap(
			(style) =>
				style?.[0].split(',').map((family) =>
					family
						.trim()
						.replace(/^(['"])(.*)\1$/, '$2')
						.toLowerCase(),
				) ?? [],
		),
	);
	const cssFontRules = textElements.length
		? getCssFontRules(svg, fontFamilies)
		: [];

	if (cssFontRules.length) {
		const ownerWindow = svg.ownerDocument.defaultView! as Window &
			typeof globalThis;
		const clonedStyles = svgForSerialization.querySelectorAll('style');
		svg.querySelectorAll('style').forEach((style, index) => {
			const {sheet} = style;
			if (!sheet) return;
			// SVG-local rules must use the same owning-window conditions as the
			// embedded font snapshot; otherwise inactive faces can override it.
			const active =
				!sheet.disabled &&
				(!sheet.media.mediaText ||
					ownerWindow.matchMedia(sheet.media.mediaText).matches);
			clonedStyles[index].removeAttribute('media');
			clonedStyles[index].textContent = active
				? getActiveCssRules(sheet.cssRules, ownerWindow)
						.map((rule) => rule.cssText)
						.join('')
				: '';
		});
	}

	const serializedSvg = new XMLSerializer()
		.serializeToString(svgForSerialization)
		// eslint-disable-next-line no-control-regex
		.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');

	if (originalStyle === null) {
		svg.removeAttribute('style');
	} else {
		svg.setAttribute('style', originalStyle);
	}

	if (needsExplicitDimensions) {
		if (originalWidth === null) {
			svg.removeAttribute('width');
		} else {
			svg.setAttribute('width', originalWidth);
		}

		if (originalHeight === null) {
			svg.removeAttribute('height');
		} else {
			svg.setAttribute('height', originalHeight);
		}
	}

	const embeddedFontStyle = getEmbeddedFontStyleForSvg(svg);
	const fontStyleKey = cssFontRules.length
		? JSON.stringify([
				embeddedFontStyle?.cacheKey ?? null,
				cssFontRules.map((rule) => [rule.css, rule.url]),
			])
		: (embeddedFontStyle?.cacheKey ?? null);
	const cached = drawableBySvg.get(svg);
	if (
		cached?.serializedSvg === serializedSvg &&
		cached.fontStyleKey === fontStyleKey
	) {
		return cached.drawable;
	}

	const cssFontStyle = Promise.all(
		cssFontRules.map(async (rule) => {
			if (rule.url === null) return rule.css;
			const fontData = await NoReactInternals.fetchFontData(rule.url);
			const src = `url("data:application/octet-stream;base64,${getBase64(fontData)}")`;
			return `@font-face{${rule.declarations.map(([name, value]) => `${name}:${name === 'src' ? src : value}`).join(';')}}`;
		}),
	).then((rules) => {
		const css = rules.join('').replace(/]]>/g, ']]]]><![CDATA[>');
		return css ? `<style type="text/css"><![CDATA[${css}]]></style>` : '';
	});
	const drawable = new Promise<HTMLImageElement>((resolve, reject) => {
		const image = new Image();
		const openingTagEnd = serializedSvg.indexOf('>');
		let url: string;

		image.onload = function () {
			URL.revokeObjectURL(url);
			resolve(image);
		};

		image.onerror = () => {
			URL.revokeObjectURL(url);
			reject(new Error('Failed to convert SVG to image'));
		};

		cssFontStyle
			.then((style) => {
				const blobParts: BlobPart[] =
					openingTagEnd === -1
						? [serializedSvg]
						: [
								serializedSvg.slice(0, openingTagEnd + 1),
								embeddedFontStyle?.blob ?? '',
								style,
								serializedSvg.slice(openingTagEnd + 1),
							];
				url = URL.createObjectURL(
					new Blob(blobParts, {type: 'image/svg+xml;charset=utf-8'}),
				);
				image.src = url;
			})
			.catch(reject);
	});
	drawableBySvg.set(svg, {fontStyleKey, serializedSvg, drawable});
	drawable.catch(() => {
		if (drawableBySvg.get(svg)?.drawable === drawable) {
			drawableBySvg.delete(svg);
		}
	});
	return drawable;
};
