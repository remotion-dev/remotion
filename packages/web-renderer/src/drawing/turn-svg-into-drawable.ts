import {
	getEmbeddedFontStyleForSvg,
	insertFontStyleInSvg,
} from './embed-registered-fonts-in-svg';
import {preserveSvgAttributeSelectors} from './preserve-svg-style-selectors';

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

const drawableBySvg = new WeakMap<
	SVGSVGElement,
	{
		fontStyleKey: string | null;
		serializedSvg: string;
		drawable: Promise<HTMLImageElement>;
	}
>();

export const turnSvgIntoDrawable = (svg: SVGSVGElement) => {
	const {fill, color, width, height, opacity} = getComputedStyle(svg);
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

	const embeddedFontStyle = getEmbeddedFontStyleForSvg(svg);
	// Non-CSS style elements do not parse carried font rules. Clone sheets are detached.
	let fontStyleIndex = Array.from(svg.querySelectorAll('style'), (style) =>
		Boolean(style.sheet),
	).lastIndexOf(true);

	const authoredElements =
		textElements.length > 0 ? [svg, ...svg.querySelectorAll('*')] : null;
	const authoredStyles =
		authoredElements?.map((element) => element.getAttribute('style')) ?? null;
	const authoredMedia =
		authoredElements?.map((element) => element.getAttribute('media')) ?? null;
	const authoredEmpty =
		authoredElements?.map((element) => element.matches(':empty')) ?? null;

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
	if (embeddedFontStyle && styles[fontStyleIndex]?.matches(':empty')) {
		// Keep an authored empty sheet empty when an earlier active carrier can
		// retain font order. A later CSSOM rule remains an ordering boundary.
		for (let index = styles.length - 1; index >= 0; index--) {
			const style = styles[index];
			const {sheet} = style;
			if (!sheet) continue;
			let ruleCount: number;
			try {
				ruleCount = sheet.cssRules.length;
			} catch {
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

			if (ruleCount !== 0) break;
		}
	}

	// A titled sheet can be inactive without sheet.disabled being set. Put
	// registered faces after local faces in every candidate when sets are used.
	// Empty and disabled sheets can still be selected by the image document;
	// their paint is normalized separately from font availability.
	const usesStylesheetSets = Boolean(
		styles[fontStyleIndex]?.getAttribute('title')?.trim(),
	);
	const fontCarriers =
		embeddedFontStyle && usesStylesheetSets
			? Array.from(styles, (style, index) =>
					style.sheet ? index : null,
				).filter((index) => index !== null)
			: [fontStyleIndex];

	if (embeddedFontStyle) {
		const clonedStyles = svgForSerialization.querySelectorAll('style');
		for (const index of fontCarriers) {
			const carrier = styles[index];
			if (carrier?.sheet && !carrier.sheet.disabled) {
				clonedStyles[index].textContent =
					Array.from(carrier.sheet.cssRules, (rule) => rule.cssText).join('') ||
					'/* Empty stylesheet rules. */';
			}
		}
	}

	if (authoredStyles || authoredMedia || authoredEmpty)
		preserveSvgAttributeSelectors({
			svg: svgForSerialization,
			authoredStyles,
			authoredMedia,
			authoredEmpty,
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

	const carrierMedia = embeddedFontStyle
		? fontCarriers.map((index) => {
				const media = styles[index]?.getAttribute('media');
				return (
					!media || svg.ownerDocument.defaultView!.matchMedia(media).matches
				);
			})
		: null;
	const fontStyleKey = embeddedFontStyle
		? JSON.stringify([
				embeddedFontStyle.cacheKey,
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

	const drawable = new Promise<HTMLImageElement>((resolve, reject) => {
		const image = new Image();

		let markup = serializedSvg;
		if (embeddedFontStyle) {
			if (usesStylesheetSets && fontCarriers.length) {
				for (const index of fontCarriers)
					insertFontStyleInSvg(
						svgForSerialization,
						embeddedFontStyle.css,
						index,
					);
			} else {
				insertFontStyleInSvg(
					svgForSerialization,
					embeddedFontStyle.css,
					usesStylesheetSets ? -1 : fontStyleIndex,
				);
			}

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
	drawableBySvg.set(svg, {fontStyleKey, serializedSvg, drawable});
	drawable.catch(() => {
		if (drawableBySvg.get(svg)?.drawable === drawable) {
			drawableBySvg.delete(svg);
		}
	});
	return drawable;
};
