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

const getSvgFontElements = (svg: SVGSVGElement) => {
	const isSvgElement = (element: Element): element is SVGElement =>
		element.namespaceURI === 'http://www.w3.org/2000/svg';
	const elements = new Set(
		Array.from(svg.querySelectorAll('text, tspan, textPath')).filter(
			isSvgElement,
		),
	);
	for (const element of [...elements]) {
		const walker = svg.ownerDocument.createTreeWalker(element, 4);
		while (walker.nextNode()) {
			const parent = walker.currentNode.parentElement;
			if (
				walker.currentNode.textContent?.length &&
				parent &&
				isSvgElement(parent)
			)
				elements.add(parent);
		}
	}

	return [...elements];
};

const svgDefinitionElements =
	'defs, symbol, pattern, mask, clipPath, marker, filter, linearGradient, radialGradient';

const getReferencedTemplates = (svg: SVGSVGElement) => {
	const documentUrl = new URL(svg.ownerDocument.URL);
	documentUrl.hash = '';
	const templates = new Set<Element>();
	const elements: Element[] = [svg];
	const ownerWindow = svg.ownerDocument.defaultView ?? window;
	const addReference = (
		value: string,
		element: Element,
		allowed: string | null,
	) => {
		try {
			const url = new URL(value, element.baseURI);
			const id = decodeURIComponent(url.hash.slice(1));
			url.hash = '';
			if (url.href !== documentUrl.href) return;
			const template = svg.getElementById(id);
			if (
				!template ||
				templates.has(template) ||
				(allowed !== null && !template.matches(allowed))
			)
				return;
			templates.add(template);
			elements.push(template);
		} catch {
			// Invalid or external authored references do not activate local resources.
		}
	};

	for (const element of elements) {
		if (element.namespaceURI !== 'http://www.w3.org/2000/svg') continue;
		if (
			element.matches('use, pattern, linearGradient, radialGradient, filter')
		) {
			const href =
				element.getAttribute('href') ??
				element.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
			if (href)
				addReference(
					href,
					element,
					element.localName === 'use' ? null : element.localName,
				);
		}

		const style = ownerWindow.getComputedStyle(element);
		for (const [property, allowed] of [
			['fill', 'pattern, linearGradient, radialGradient'],
			['stroke', 'pattern, linearGradient, radialGradient'],
			['mask-image', 'mask'],
			['clip-path', 'clipPath'],
			['filter', 'filter'],
			['marker-start', 'marker'],
			['marker-mid', 'marker'],
			['marker-end', 'marker'],
		]) {
			const value = style.getPropertyValue(property);
			for (const match of value.matchAll(
				/url\((?:"([^"\\]*)"|'([^'\\]*)'|([^()\\]*))\)/g,
			)) {
				addReference(match[1] ?? match[2] ?? match[3], element, allowed);
			}
		}

		for (const child of element.children) {
			if (!child.matches(svgDefinitionElements)) elements.push(child);
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
	const visitSheet = (sheet: CSSStyleSheet) => {
		if (
			sheet.disabled ||
			(sheet.media.mediaText &&
				!ownerWindow.matchMedia(sheet.media.mediaText).matches)
		)
			return;
		let cssRules: CSSRuleList;
		try {
			cssRules = sheet.cssRules;
		} catch (error) {
			if (
				error instanceof ownerWindow.DOMException &&
				error.name === 'SecurityError'
			)
				return;
			throw error;
		}

		const baseUrl = sheet.href ?? svg.baseURI;
		for (const rule of getActiveCssRules(cssRules, ownerWindow)) {
			if (rule instanceof ownerWindow.CSSImportRule) {
				// Layer ordering remains outside this source-selection subset.
				if (
					(rule.layerName === null || rule.layerName === undefined) &&
					rule.styleSheet !== null
				)
					visitSheet(rule.styleSheet);
				continue;
			}

			if (!(rule instanceof ownerWindow.CSSFontFaceRule)) continue;
			const family = parseFontFamilies(rule.style.fontFamily)[0];
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
				const faces = Array.from(svg.ownerDocument.fonts).filter((face) =>
					matchesFontFaceFamily(face.family, family),
				);
				if (faces.length !== 1 || faces[0].status !== 'loaded') continue;
				if (
					resolved.origin !== ownerWindow.origin ||
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

	for (const sheet of [
		...svg.ownerDocument.styleSheets,
		...(svg.ownerDocument.adoptedStyleSheets ?? []),
	])
		visitSheet(sheet);

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
	const textElements = getSvgFontElements(svg);
	const referencedTemplates = textElements.length
		? getReferencedTemplates(svg)
		: new Set<Element>();
	const textStyles = textElements.map((element) => {
		// Templates inherit font selection from each <use> instance.
		if (element.closest(svgDefinitionElements)) return null;
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
			let ancestor: Element | null = parent;
			while (
				ancestor !== null &&
				ancestor !== svg &&
				!referencedTemplates.has(ancestor) &&
				!ancestor.matches(svgDefinitionElements)
			)
				ancestor = ancestor.parentElement;
			if (
				ancestor === null ||
				(ancestor !== svg && !referencedTemplates.has(ancestor))
			)
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

	// CSSOM-only selectors can depend on attributes and emptiness even when the
	// authored style elements contain no text. Snapshot before normalizing them.
	const authoredStyles =
		textElements.length > 0
			? [svg, ...svg.querySelectorAll('*')].map((element) =>
					element.getAttribute('style'),
				)
			: null;
	const authoredEmpty =
		textElements.length > 0
			? [svg, ...svg.querySelectorAll('*')].map((element) =>
					element.matches(':empty'),
				)
			: null;

	const authoredMedia =
		textElements.length > 0
			? [svg, ...svg.querySelectorAll('*')].map((element) =>
					element.getAttribute('media'),
				)
			: null;

	return {
		textStyles,
		authoredStyles,
		authoredEmpty,
		authoredMedia,
		cssFontRules,
		embeddedFontStyle: getEmbeddedFontStyleForSvg(svg),
	};
};

export const turnSvgIntoDrawable = (
	svg: SVGSVGElement,
	fontSnapshot: ReturnType<typeof getSvgFontSnapshot> | null = null,
) => {
	const {fill, color, width, height, opacity} = getComputedStyle(svg);
	const {
		textStyles,
		authoredStyles,
		authoredEmpty,
		authoredMedia,
		cssFontRules,
		embeddedFontStyle,
	} = fontSnapshot ?? getSvgFontSnapshot(svg);
	// Non-CSS style elements do not parse carried font rules. Clone sheets are detached.
	let fontStyleIndex = Array.from(svg.querySelectorAll('style'), (style) =>
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

	getSvgFontElements(svgForSerialization).forEach((element, index) => {
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
	const originalFontStyleIndex = fontStyleIndex;
	const retargetRegisteredCarrier =
		cssFontRules.length === 0 &&
		embeddedFontStyle !== null &&
		styles[fontStyleIndex]?.matches(':empty');
	if (cssFontRules.length || retargetRegisteredCarrier) {
		// CSS-backed sheets are serialized below. Registered-only snapshots may
		// move off an empty carrier only when the chosen sheet is serialized too.
		const originalStyles = svg.querySelectorAll('style');
		for (let index = originalStyles.length - 1; index >= 0; index--) {
			const style = originalStyles[index];
			const {sheet} = style;
			if (!sheet) continue;
			let ruleCount: number;
			try {
				ruleCount = sheet.cssRules.length;
			} catch {
				// An unreadable sheet cannot establish a safe carrier or ordering boundary.
				break;
			}

			const media = sheet.media.mediaText;
			if (
				!sheet.disabled &&
				(!media || media.toLowerCase() === 'all') &&
				!style.matches(':empty')
			) {
				fontStyleIndex = index;
				break;
			}

			// Even an inactive rule can affect face order after serialization.
			// In particular, empty text can still have CSSOM-inserted rules.
			if (ruleCount !== 0) break;
		}
	}

	const usesStylesheetSets = Boolean(
		styles[fontStyleIndex]?.getAttribute('title')?.trim(),
	);
	// Image documents may select a different titled set. Disabled paint was
	// neutralized above, but its carrier must still provide the embedded faces.
	// Include the first titled sheet even when empty: it selects the preferred
	// set. Other empty sheets need no duplicate font payload.
	const firstTitledCarrier = usesStylesheetSets
		? Array.from(styles).findIndex(
				(style) => style.sheet && Boolean(style.getAttribute('title')?.trim()),
			)
		: -1;
	const fontCarriers = usesStylesheetSets
		? Array.from(styles, (style, index) =>
				style.sheet &&
				(!style.matches(':empty') || index === firstTitledCarrier)
					? index
					: null,
			).filter((index) => index !== null)
		: [fontStyleIndex];
	if (cssFontRules.length === 0 && embeddedFontStyle !== null) {
		for (const index of fontCarriers) {
			const style = styles[index];
			if (style?.sheet && !style.sheet.disabled && !style.matches(':empty')) {
				// CSSOM drops an unterminated comment that would consume appended faces.
				svgForSerialization.querySelectorAll('style')[index].textContent =
					Array.from(style.sheet.cssRules, (rule) => rule.cssText).join('') ||
					'/* Empty stylesheet rules. */';
			}
		}
	}

	if (cssFontRules.length) {
		const ownerWindow = svg.ownerDocument.defaultView! as Window &
			typeof globalThis;
		const clonedStyles = svgForSerialization.querySelectorAll('style');
		svg.querySelectorAll('style').forEach((style, index) => {
			const {sheet} = style;
			if (!sheet || sheet.disabled) return;
			// SVG-local rules must use the same owning-window conditions as the
			// embedded font snapshot; otherwise inactive faces can override it.
			const active =
				!sheet.media.mediaText ||
				ownerWindow.matchMedia(sheet.media.mediaText).matches;
			if (
				sheet.media.mediaText &&
				sheet.media.mediaText.toLowerCase() !== 'all'
			) {
				clonedStyles[index].removeAttribute('media');
			}

			const css = active
				? getActiveCssRules(sheet.cssRules, ownerWindow)
						.map((rule) => rule.cssText)
						.join('')
				: '';
			clonedStyles[index].textContent =
				css || (style.matches(':empty') ? '' : '/* Empty stylesheet rules. */');
		});
	}

	if (authoredStyles || authoredEmpty || authoredMedia)
		preserveSvgStyleSelectors({
			svg: svgForSerialization,
			authoredStyles,
			authoredEmpty,
			authoredMedia,
		});

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

	const carrierMedia = fontCarriers.map((index) => {
		const media = styles[index]?.getAttribute('media');
		return !media || svg.ownerDocument.defaultView!.matchMedia(media).matches;
	});
	const fontStyleKey =
		usesStylesheetSets ||
		embeddedFontStyle ||
		cssFontRules.length ||
		(retargetRegisteredCarrier && fontStyleIndex !== originalFontStyleIndex)
			? JSON.stringify([
					embeddedFontStyle?.cacheKey ?? null,
					cssFontRules.map((rule) => [rule.css, rule.url]),
					fontStyleIndex,
					fontCarriers,
					carrierMedia,
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
					if (usesStylesheetSets && fontCarriers.length) {
						for (const index of fontCarriers)
							insertFontStyleInSvg(svgForSerialization, fontCss, index);
					} else
						insertFontStyleInSvg(
							svgForSerialization,
							fontCss,
							usesStylesheetSets ? -1 : fontStyleIndex,
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
