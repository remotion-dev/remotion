import {NoReactInternals} from 'remotion/no-react';
import {
	getBase64,
	getEmbeddedFontStyleForSvg,
	insertFontStyleInSvg,
} from './embed-registered-fonts-in-svg';
import {matchesFontFaceFamily, parseFontFamilies} from './parse-font-families';
import {preserveSvgStyleSelectors} from './preserve-svg-style-selectors';

const textFontProperties = [
	'font-family',
	'font-size',
	'font-style',
	'font-weight',
	'font-stretch',
] as const;

const serializeSvg = (svg: SVGSVGElement) =>
	new XMLSerializer()
		.serializeToString(svg)
		// eslint-disable-next-line no-control-regex
		.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');

const getSvgTextElements = (svg: SVGSVGElement) =>
	Array.from(
		svg.querySelectorAll<SVGTextContentElement>('text, tspan, textPath'),
	).filter((element) => element.namespaceURI === 'http://www.w3.org/2000/svg');

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

// Font sources must be self-contained before the SVG is loaded as an image.
const getCssFontRules = (svg: SVGSVGElement, fontFamilies: Set<string>) => {
	const rules: CssFontRule[] = [];
	const ownerWindow = svg.ownerDocument.defaultView ?? window;
	const containsSelectedFace = (cssRules: CSSRuleList): boolean =>
		Array.from(cssRules).some((rule) =>
			rule instanceof ownerWindow.CSSFontFaceRule
				? fontFamilies.has(parseFontFamilies(rule.style.fontFamily)[0])
				: 'cssRules' in rule &&
					containsSelectedFace(rule.cssRules as CSSRuleList),
		);
	const retainFontGroup = (rule: CSSRule) => {
		if (typeof ownerWindow.CSSStyleSheet.prototype.replaceSync !== 'function')
			return '';
		const snapshot = new ownerWindow.CSSStyleSheet();
		snapshot.replaceSync(rule.cssText);
		const prune = (parent: CSSStyleSheet | CSSGroupingRule) => {
			for (let index = parent.cssRules.length - 1; index >= 0; index--) {
				const child = parent.cssRules[index];
				if (child instanceof ownerWindow.CSSFontFaceRule) {
					if (!fontFamilies.has(parseFontFamilies(child.style.fontFamily)[0]))
						parent.deleteRule(index);
				} else if (
					'cssRules' in child &&
					containsSelectedFace(child.cssRules as CSSRuleList)
				) {
					if (child instanceof ownerWindow.CSSStyleRule)
						child.style.cssText = '';
					prune(child as CSSGroupingRule);
				} else parent.deleteRule(index);
			}
		};

		prune(snapshot);
		return Array.from(snapshot.cssRules, (child) => child.cssText).join('');
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
			if (
				error instanceof ownerWindow.DOMException &&
				error.name === 'SecurityError'
			)
				continue;
			throw error;
		}

		for (const rule of cssRules) {
			if (!(rule instanceof ownerWindow.CSSFontFaceRule)) {
				if (
					sheet.ownerNode !== null &&
					svg.contains(sheet.ownerNode) &&
					'cssRules' in rule &&
					containsSelectedFace(rule.cssRules as CSSRuleList)
				) {
					const css = retainFontGroup(rule);
					if (css) rules.push({css, url: null, declarations: []});
				}

				continue;
			}

			const family = parseFontFamilies(rule.style.fontFamily)[0];
			if (!fontFamilies.has(family)) continue;
			const src = rule.style.getPropertyValue('src');
			// Multiple sources and CSS-escaped URLs need separate source selection.
			const source =
				/^url\((?:"([^"\\]*)"|'([^'\\]*)'|([^()\\]*))\)(?:\s+format\([^)]*\))?$/i.exec(
					src,
				);
			if (!source) {
				// Retained SVG-local faces keep their authored order even when their
				// source list is outside the external-font embedding subset.
				if (sheet.ownerNode !== null && svg.contains(sheet.ownerNode)) {
					rules.push({
						css: rule.cssText,
						url: null,
						declarations: Array.from(rule.style, (name) => [
							name,
							rule.style.getPropertyValue(name),
						]),
					});
				}

				continue;
			}

			const sourceUrl = source[1] ?? source[2] ?? source[3];
			let url: string | null = null;
			if (!/^data:/i.test(sourceUrl)) {
				let resolved: URL;
				try {
					resolved = new URL(sourceUrl, sheet.href ?? svg.baseURI);
				} catch {
					// Invalid authored font URLs retain the browser's fallback behavior.
					continue;
				}

				// FontFace exposes no source URL. Limit this slice to a unique loaded
				// face, so an unused or failed CSS source is not fetched for export.
				const faces = Array.from(svg.ownerDocument.fonts).filter((face) =>
					matchesFontFaceFamily(face.family, family),
				);
				if (faces.length !== 1 || faces[0].status !== 'loaded') continue;
				if (
					resolved.origin !== svg.ownerDocument.defaultView?.origin ||
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

export const getSvgFontSnapshot = (svg: SVGSVGElement) => {
	const textElements = getSvgTextElements(svg);
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

	// Discover the families of actual text-node parents, including template text.
	const fontFamilies = new Set<string>();
	const computedStyles = new WeakMap<Element, CSSStyleDeclaration>();
	for (const element of textElements) {
		const walker = svg.ownerDocument.createTreeWalker(element, 4);
		while (walker.nextNode()) {
			if (!walker.currentNode.textContent?.length) continue;
			const parent = walker.currentNode.parentElement;
			if (!parent || parent.namespaceURI !== 'http://www.w3.org/2000/svg')
				continue;
			let style = computedStyles.get(parent);
			if (!style) {
				style = (svg.ownerDocument.defaultView ?? window).getComputedStyle(
					parent,
				);
				computedStyles.set(parent, style);
			}

			for (const family of parseFontFamilies(style.fontFamily))
				fontFamilies.add(family);
		}
	}

	const cssFontRules = fontFamilies.size
		? getCssFontRules(svg, fontFamilies)
		: [];

	const authoredStyles =
		textStyles.some((style) => style !== null) &&
		Array.from(svg.querySelectorAll('style')).some((style) =>
			style.textContent?.includes('['),
		)
			? [svg, ...svg.querySelectorAll('*')].map((element) =>
					element.getAttribute('style'),
				)
			: null;
	return {
		textStyles,
		authoredStyles,
		cssFontRules,
		embeddedFontStyle: getEmbeddedFontStyleForSvg(svg),
	};
};

export const turnSvgIntoDrawable = (
	svg: SVGSVGElement,
	fontSnapshot: ReturnType<typeof getSvgFontSnapshot> | null = null,
) => {
	const {fill, color, width, height, opacity} = getComputedStyle(svg);
	const {textStyles, authoredStyles, cssFontRules, embeddedFontStyle} =
		fontSnapshot ?? getSvgFontSnapshot(svg);
	// Non-CSS style elements do not parse carried font rules. Clone sheets are detached.
	const fontStyleIndex = Array.from(svg.querySelectorAll('style'), (style) =>
		Boolean(style.sheet),
	).lastIndexOf(true);

	// Only direct children can inherit the root opacity. Preserve their computed
	// values before neutralizing the root; descendants then inherit as authored.
	const childOpacities =
		opacity === '1'
			? []
			: Array.from(svg.children, (child) => ({
					child: child as SVGElement,
					opacity: getComputedStyle(child).opacity,
					style: child.getAttribute('style'),
				})).filter((child) => child.opacity !== '1');
	for (const child of childOpacities) {
		child.child.style.setProperty('opacity', child.opacity, 'important');
	}

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

	// Position, transforms, and opacity are applied by the canvas renderer. Remove them
	// from the serialized SVG so they are not applied again inside its viewport.
	svg.style.position = 'static';
	svg.style.inset = 'auto';
	svg.style.transform = 'none';
	svg.style.setProperty('opacity', '1', 'important');
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
	// CSSStyleSheet.disabled is runtime state and is not serialized as markup.
	// Neutralize rules only in a clone, preserving nodes for structural selectors.
	const styles = svg.querySelectorAll('style');
	const carrierMedia = styles[fontStyleIndex]?.getAttribute('media');
	const carrierMediaMatches =
		!carrierMedia ||
		(svg.ownerDocument.defaultView ?? window).matchMedia(carrierMedia).matches;
	const hasDisabledStyles = Array.from(styles).some(
		(style) => style.sheet?.disabled,
	);
	// External stylesheet rules disappear when the SVG becomes an image.
	// Preserve resolved font selection without mutating mounted text elements.
	const svgForSerialization =
		textStyles.length === 0 && embeddedFontStyle === null && !hasDisabledStyles
			? svg
			: (svg.cloneNode(true) as SVGSVGElement);
	if (hasDisabledStyles) {
		const clonedStyles = svgForSerialization.querySelectorAll('style');
		for (let i = 0; i < styles.length; i++) {
			if (styles[i].sheet?.disabled) {
				const text = styles[i].textContent;
				// Preserve :empty as well as the element's structural position.
				clonedStyles[i].textContent = text?.trim()
					? '/* Disabled stylesheet. */'
					: text;
			}
		}
	}

	getSvgTextElements(svgForSerialization).forEach((element, index) => {
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

	if (authoredStyles)
		preserveSvgStyleSelectors({svg: svgForSerialization, authoredStyles});

	const serializedSvg = serializeSvg(svgForSerialization);

	for (const child of childOpacities) {
		if (child.style === null) {
			child.child.removeAttribute('style');
		} else {
			child.child.setAttribute('style', child.style);
		}
	}

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

	const fontStyleKey =
		cssFontRules.length || embeddedFontStyle !== null
			? JSON.stringify([
					embeddedFontStyle?.cacheKey ?? null,
					cssFontRules.map((rule) => [rule.css, rule.url]),
					fontStyleIndex,
					carrierMediaMatches,
				])
			: null;
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
	).then((rules) => rules.join(''));
	const drawable = new Promise<HTMLImageElement>((resolve, reject) => {
		const image = new Image();
		let url: string | null = null;
		const hasForeignObject = svg.querySelector('foreignObject') !== null;

		image.onload = function () {
			if (url !== null) URL.revokeObjectURL(url);
			resolve(image);
		};

		image.onerror = () => {
			if (url !== null) URL.revokeObjectURL(url);
			reject(new Error('Failed to convert SVG to image'));
		};

		cssFontStyle
			.then((css) => {
				// Script-added faces follow CSS-connected faces in FontFaceSet order.
				const fontCss = css + (embeddedFontStyle?.css ?? '');
				let markup = serializedSvg;
				if (fontCss) {
					insertFontStyleInSvg(
						svgForSerialization,
						fontCss,
						fontStyleIndex,
						carrierMediaMatches,
					);
					markup = serializeSvg(svgForSerialization);
				}

				const blob = new Blob([markup], {type: 'image/svg+xml;charset=utf-8'});
				// Preserve main's origin-clean foreignObject loading after font data resolves.
				if (hasForeignObject) {
					return blob.text().then((svgMarkup) => {
						image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;
					});
				}

				url = URL.createObjectURL(blob);
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
