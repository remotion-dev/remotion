import {
	getEmbeddedFontStyleForSvg,
	insertFontStyleInSvg,
} from './embed-registered-fonts-in-svg';
import {parseFontFamilies} from './parse-font-families';
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

// SVG images cannot load external font resources. Self-contained data fonts from
// accessible stylesheets can be carried into the serialized SVG without fetching.
const getCssDataFontRules = (svg: SVGSVGElement, fontFamilies: Set<string>) => {
	const rules: string[] = [];
	const ownerWindow = svg.ownerDocument.defaultView ?? window;
	const collectRules = (cssRules: CSSRuleList, retainedLocalSheet: boolean) => {
		for (const rule of cssRules) {
			// Unconditional local groups remain in the SVG image. Carry their faces
			// in order so an earlier copied definition cannot override them.
			if (
				retainedLocalSheet &&
				rule instanceof ownerWindow.CSSMediaRule &&
				rule.conditionText.toLowerCase() === 'all'
			) {
				collectRules(rule.cssRules, retainedLocalSheet);
				continue;
			}

			if (!(rule instanceof ownerWindow.CSSFontFaceRule)) continue;
			const family = parseFontFamilies(rule.style.fontFamily)[0];
			if (!fontFamilies.has(family)) continue;
			const src = rule.style.getPropertyValue('src');
			// Keep only one self-contained source, without local/network fallbacks.
			if (
				!/^url\((?:"data:[^"]*"|'data:[^']*'|data:[^)]*)\)(?:\s+format\([^)]*\))?(?:\s+tech\([^)]*\))?$/i.test(
					src,
				)
			)
				continue;
			rules.push(rule.cssText);
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
			if (
				error instanceof ownerWindow.DOMException &&
				error.name === 'SecurityError'
			)
				continue;
			throw error;
		}

		collectRules(
			cssRules,
			sheet.ownerNode !== null && svg.contains(sheet.ownerNode),
		);
	}

	return rules.join('');
};

const drawableBySvg = new WeakMap<
	SVGSVGElement,
	{
		fontStyleKey: string | null;
		cssFontRules: string;
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
		? getCssDataFontRules(svg, fontFamilies)
		: '';

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

	// Script-added faces follow CSS-connected faces in FontFaceSet order.
	const hasFontCss = Boolean(cssFontRules) || embeddedFontStyle !== null;
	if (hasFontCss && styles[fontStyleIndex]?.matches(':empty')) {
		for (let index = styles.length - 1; index >= 0; index--) {
			const style = styles[index];
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

			// Even inactive CSSOM rules preserve an authored ordering boundary.
			if (ruleCount !== 0) break;
		}
	}

	if (hasFontCss) {
		const carrier = styles[fontStyleIndex];
		if (
			carrier?.sheet &&
			!carrier.sheet.disabled &&
			!carrier.matches(':empty')
		) {
			// End malformed comments before appending carried faces.
			svgForSerialization.querySelectorAll('style')[
				fontStyleIndex
			].textContent =
				Array.from(carrier.sheet.cssRules, (rule) => rule.cssText).join('') ||
				'/* Empty stylesheet rules. */';
		}
	}

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

	const carrierMedia = styles[fontStyleIndex]?.getAttribute('media');
	const fontStyleKey = hasFontCss
		? JSON.stringify([
				embeddedFontStyle?.cacheKey ?? null,
				fontStyleIndex,
				!carrierMedia ||
					(svg.ownerDocument.defaultView ?? window).matchMedia(carrierMedia)
						.matches,
			])
		: null;
	const cached = drawableBySvg.get(svg);
	if (
		cached?.serializedSvg === serializedSvg &&
		cached.fontStyleKey === fontStyleKey &&
		cached.cssFontRules === cssFontRules
	) {
		return cached.drawable;
	}

	const drawable = new Promise<HTMLImageElement>((resolve, reject) => {
		const image = new Image();
		let markup = serializedSvg;
		if (hasFontCss) {
			const fontCss = cssFontRules + (embeddedFontStyle?.css ?? '');
			insertFontStyleInSvg(svgForSerialization, fontCss, fontStyleIndex);
			markup = serializeSvg(svgForSerialization);
		}

		const blob = new Blob([markup], {
			type: 'image/svg+xml;charset=utf-8',
		});
		// Chromium taints canvases drawn from blob SVGs containing foreignObject.
		const url = svg.querySelector('foreignObject')
			? null
			: URL.createObjectURL(blob);

		image.onload = function () {
			if (url !== null) URL.revokeObjectURL(url);
			resolve(image);
		};

		image.onerror = () => {
			if (url !== null) URL.revokeObjectURL(url);
			reject(new Error('Failed to convert SVG to image'));
		};

		if (url !== null) {
			image.src = url;
		} else {
			blob
				.text()
				.then((svgMarkup) => {
					image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;
				})
				.catch(reject);
		}
	});
	drawableBySvg.set(svg, {fontStyleKey, cssFontRules, serializedSvg, drawable});
	drawable.catch(() => {
		if (drawableBySvg.get(svg)?.drawable === drawable) {
			drawableBySvg.delete(svg);
		}
	});
	return drawable;
};
