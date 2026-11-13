import {
	getEmbeddedFontStyleForSvg,
	insertFontStyleInSvg,
} from './embed-registered-fonts-in-svg';
import {
	fingerprintCssFontGroups,
	type CssFontGroupSample,
} from './fingerprint-css-font-groups';
import {parseFontFamilies} from './parse-font-families';
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

const getSvgFontElements = (svg: SVGSVGElement) => {
	const isSvgElement = (element: Element): element is SVGElement =>
		element.namespaceURI === 'http://www.w3.org/2000/svg';
	const elements = new Set(
		Array.from(svg.querySelectorAll('text, tspan, textPath')).filter(
			isSvgElement,
		),
	);
	for (const element of [...elements]) {
		const walker = svg.ownerDocument.createTreeWalker(
			element,
			NodeFilter.SHOW_TEXT | NodeFilter.SHOW_CDATA_SECTION,
		);
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
const invalidUseTargets =
	'defs, pattern, mask, clipPath, marker, filter, linearGradient, radialGradient';

const getLocalSvgReference = (
	svg: SVGSVGElement,
	value: string,
	base: string,
) => {
	try {
		const documentUrl = new URL(svg.ownerDocument.URL);
		documentUrl.hash = '';
		const url = new URL(value, base);
		const id = decodeURIComponent(url.hash.slice(1));
		url.hash = '';
		return url.href === documentUrl.href ? svg.getElementById(id) : null;
	} catch {
		return null;
	}
};

const getReferencedTemplates = (
	svg: SVGSVGElement,
	styleFor: (element: Element) => CSSStyleDeclaration,
) => {
	const templates = new Set<Element>();
	const uses = new Set<SVGUseElement>();
	const visited = new Set<Element>();
	const elements: Element[] = [svg];
	const addResource = (element: Element, value: string, allowed: string) => {
		const resource = getLocalSvgReference(svg, value, element.baseURI);
		if (resource?.matches(allowed)) elements.push(resource);
	};

	for (const element of elements) {
		if (
			visited.has(element) ||
			element.namespaceURI !== 'http://www.w3.org/2000/svg'
		)
			continue;
		visited.add(element);
		const style = styleFor(element);
		if (style.display === 'none') continue;
		if (element.localName === 'use') {
			const use = element as SVGUseElement;
			const target = getLocalSvgReference(svg, use.href.baseVal, use.baseURI);
			if (target && !target.matches(invalidUseTargets)) {
				templates.add(target);
				uses.add(use);
				elements.push(target);
			}
		} else if (
			element.matches(
				'pattern, linearGradient, radialGradient, filter, feImage',
			)
		) {
			const href =
				element.getAttribute('href') ??
				element.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
			if (href)
				addResource(
					element,
					href,
					element.localName === 'feImage'
						? `:not(${invalidUseTargets})`
						: element.localName,
				);
		}

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
			for (const match of style
				.getPropertyValue(property)
				.matchAll(/url\((?:"([^"\\]*)"|'([^'\\]*)'|([^()\\]*))\)/g))
				addResource(element, match[1] ?? match[2] ?? match[3], allowed);
		}

		for (const child of element.children)
			if (!child.matches(svgDefinitionElements)) elements.push(child);
	}

	return {templates, uses};
};

// SVG images cannot load external font resources. Self-contained data fonts from
// accessible stylesheets can be carried into the serialized SVG without fetching.
const getCssDataFontRules = (
	svg: SVGSVGElement,
	fontFamilies: Set<string>,
	getSamples: () => CssFontGroupSample[],
	hasRegisteredFonts: boolean,
) => {
	const records: {title: string; rule: CSSFontFaceRule}[] = [];
	const deferredGroups: CSSRuleList[] = [];
	const ownerWindow = svg.ownerDocument.defaultView ?? window;
	let completeModel =
		svg.ownerDocument.defaultView !== null &&
		svg.getRootNode() === svg.ownerDocument;
	const relevantNestedFace = (cssRules: CSSRuleList): boolean =>
		Array.from(cssRules).some((rule) => {
			if (rule instanceof ownerWindow.CSSFontFaceRule)
				return fontFamilies.has(parseFontFamilies(rule.style.fontFamily)[0]);
			if (rule instanceof ownerWindow.CSSImportRule) return true;
			return (
				'cssRules' in rule &&
				relevantNestedFace((rule as CSSGroupingRule).cssRules)
			);
		});
	const collectRules = (
		cssRules: CSSRuleList,
		retainedLocalSheet: boolean,
		title: string,
	) => {
		for (const rule of cssRules) {
			// Retained local groups already remain in the serialized stylesheet.
			// Carry their active faces in the same order, so appending the snapshot
			// cannot move an earlier top-level face after a later grouped face.
			if (retainedLocalSheet && rule instanceof ownerWindow.CSSMediaRule) {
				if (ownerWindow.matchMedia(rule.conditionText).matches)
					collectRules(rule.cssRules, retainedLocalSheet, title);
				continue;
			}

			if (retainedLocalSheet && rule instanceof ownerWindow.CSSSupportsRule) {
				if (ownerWindow.CSS.supports(rule.conditionText))
					collectRules(rule.cssRules, retainedLocalSheet, title);
				continue;
			}

			// Font definitions in container and scope groups are global: neither
			// container-query matching nor a scope selector limits their activation.
			// Keep layer groups intact because their face precedence is layer-based.
			if (
				retainedLocalSheet &&
				(('CSSContainerRule' in ownerWindow &&
					rule instanceof ownerWindow.CSSContainerRule) ||
					('CSSScopeRule' in ownerWindow &&
						rule instanceof ownerWindow.CSSScopeRule))
			) {
				collectRules(rule.cssRules, retainedLocalSheet, title);
				continue;
			}

			if (!(rule instanceof ownerWindow.CSSFontFaceRule)) {
				if (rule instanceof ownerWindow.CSSImportRule) completeModel = false;
				else if ('cssRules' in rule) {
					const nested = (rule as CSSGroupingRule).cssRules;
					if (nested.length) deferredGroups.push(nested);
				}

				continue;
			}

			const family = parseFontFamilies(rule.style.fontFamily)[0];
			if (!fontFamilies.has(family)) continue;
			const dataSource =
				/^url\((?:"data:[^"]*"|'data:[^']*'|data:[^)]*)\)(?:\s+format\([^)]*\))?(?:\s+tech\([^)]*\))?$/i.test(
					rule.style.getPropertyValue('src'),
				);
			if (!dataSource) {
				completeModel = false;
				if (!retainedLocalSheet) continue;
			}

			records.push({title, rule});
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
			) {
				completeModel = false;
				continue;
			}

			throw error;
		}

		collectRules(
			cssRules,
			sheet.ownerNode !== null && svg.contains(sheet.ownerNode),
			sheet.title ?? '',
		);
	}

	const legacyRules = () => records.map(({rule}) => rule.cssText).join('');
	const titles = [...new Set(records.map(({title}) => title).filter(Boolean))];
	// Unknown source rules and registered-face precedence require their own model.
	// Keep the incumbent behavior until those contexts are qualified.
	if (!completeModel || hasRegisteredFonts || !titles.length)
		return legacyRules();
	if (deferredGroups.some(relevantNestedFace)) return legacyRules();
	const candidates = [null, ...titles];
	const groups = candidates.map((title, index) => ({
		name: String(index),
		rules: records
			.filter((record) => !record.title || record.title === title)
			.map((record) => record.rule),
	}));
	const result = fingerprintCssFontGroups(
		svg.ownerDocument,
		getSamples(),
		groups,
	);
	if (result.reason !== null || result.matches.length !== 1)
		return legacyRules();
	const selectedTitle = candidates[Number(result.matches[0])];
	return records
		.filter((record) => !record.title || record.title === selectedTitle)
		.map(({rule}) => rule.cssText)
		.join('');
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
	const computedStyles = new WeakMap<Element, CSSStyleDeclaration>();
	const styleFor = (element: Element) => {
		let style = computedStyles.get(element);
		if (!style) {
			style = (svg.ownerDocument.defaultView ?? window).getComputedStyle(
				element,
			);
			computedStyles.set(element, style);
		}

		return style;
	};

	const {templates: referencedTemplates, uses: renderedUses} =
		textElements.length &&
		svg.getElementsByTagNameNS('http://www.w3.org/2000/svg', 'use').length
			? getReferencedTemplates(svg, styleFor)
			: {templates: new Set<Element>(), uses: new Set<SVGUseElement>()};

	const textStyles = textElements.map((element) => {
		// Templates inherit font selection from each <use> instance.
		let ancestor: Element = element;
		while (ancestor !== svg) {
			if (referencedTemplates.has(ancestor)) return null;
			ancestor = ancestor.parentElement!;
		}

		const style = styleFor(element);
		return textFontProperties.map((property) =>
			style.getPropertyValue(property),
		);
	});

	// Discover the families of actual text-node parents, including template text.
	const fontFamilies = new Set<string>();
	const fontSampleNodes = new Set<Node>();
	for (const element of textElements) {
		const walker = svg.ownerDocument.createTreeWalker(
			element,
			NodeFilter.SHOW_TEXT | NodeFilter.SHOW_CDATA_SECTION,
		);
		while (walker.nextNode()) {
			if (!walker.currentNode.textContent?.length) continue;
			const parent = walker.currentNode.parentElement;
			if (!parent || parent.namespaceURI !== 'http://www.w3.org/2000/svg')
				continue;
			const style = styleFor(parent);
			fontSampleNodes.add(walker.currentNode);

			for (const family of parseFontFamilies(style.fontFamily))
				fontFamilies.add(family);
		}
	}

	// Inline/presentation font selection on an instance is inherited by its
	// referenced text, while the source definition keeps its own computed style.
	// Cache reachability per incoming text context for this snapshot only.
	// A negative search proves every visited state cannot reach rendered text.
	// Positive searches cache the successful parent path, leaving dead branches unknown.
	const renderedTextByContext = [
		new WeakMap<Element, boolean>(),
		new WeakMap<Element, boolean>(),
	] as const;
	const hasRenderedText = (root: Element) => {
		const cachedRoot = renderedTextByContext[0].get(root);
		if (cachedRoot !== undefined) return cachedRoot;
		const pending: {
			element: Element;
			withinText: boolean;
			parent: number | null;
		}[] = [{element: root, withinText: false, parent: null}];
		const cacheSuccessfulPath = (index: number) => {
			let ancestor: number | null = index;
			while (ancestor !== null) {
				const state: (typeof pending)[number] = pending[ancestor]!;
				renderedTextByContext[state.withinText ? 1 : 0].set(
					state.element,
					true,
				);
				ancestor = state.parent;
			}
		};

		const seen = [new Set<Element>(), new Set<Element>()] as const;
		for (let index = 0; index < pending.length; index++) {
			const {element, withinText} = pending[index]!;
			const context = withinText ? 1 : 0;
			const cached = renderedTextByContext[context].get(element);
			if (cached === true) {
				cacheSuccessfulPath(index);
				return true;
			}

			if (
				cached === false ||
				seen[context].has(element) ||
				element.namespaceURI !== 'http://www.w3.org/2000/svg' ||
				styleFor(element).display === 'none'
			)
				continue;
			seen[context].add(element);
			const text = withinText || element.matches('text, tspan, textPath');
			if (
				text &&
				Array.from(element.childNodes).some(
					(node) =>
						(node.nodeType === Node.TEXT_NODE ||
							node.nodeType === Node.CDATA_SECTION_NODE) &&
						Boolean(node.textContent?.length),
				)
			) {
				cacheSuccessfulPath(index);
				return true;
			}

			if (element.localName === 'use') {
				const use = element as SVGUseElement;
				const target = getLocalSvgReference(svg, use.href.baseVal, use.baseURI);
				if (target && !target.matches(invalidUseTargets))
					pending.push({element: target, withinText: text, parent: index});
			}

			for (const child of element.children)
				if (!child.matches(svgDefinitionElements))
					pending.push({element: child, withinText: text, parent: index});
		}

		for (const context of [0, 1] as const) {
			for (const element of seen[context])
				renderedTextByContext[context].set(element, false);
		}

		renderedTextByContext[0].set(root, false);
		return false;
	};

	for (const use of renderedUses) {
		const target = getLocalSvgReference(svg, use.href.baseVal, use.baseURI);
		if (!target || !hasRenderedText(target)) continue;
		for (const family of parseFontFamilies(styleFor(use).fontFamily))
			fontFamilies.add(family);
	}

	const embeddedFontStyle = getEmbeddedFontStyleForSvg(svg);
	const getSamples = (): CssFontGroupSample[] => {
		const languageFor = (element: Element) => {
			let ancestor: Element | null = element;
			while (ancestor) {
				const language =
					ancestor.getAttribute('lang') ??
					ancestor.getAttributeNS(
						'http://www.w3.org/XML/1998/namespace',
						'lang',
					);
				if (language !== null) return language;
				ancestor = ancestor.parentElement;
			}

			return '';
		};

		const samples = Array.from(fontSampleNodes, (node) => ({
			text: node.textContent!,
			style: styleFor(node.parentElement!),
			lang: languageFor(node.parentElement!),
		}));
		for (const use of renderedUses) {
			const target = getLocalSvgReference(svg, use.href.baseVal, use.baseURI);
			if (target?.textContent?.length && hasRenderedText(target))
				samples.push({
					text: target.textContent,
					style: styleFor(use),
					lang: languageFor(use),
				});
		}

		return samples;
	};

	const cssFontRules = fontFamilies.size
		? getCssDataFontRules(
				svg,
				fontFamilies,
				getSamples,
				embeddedFontStyle !== null,
			)
		: '';

	// Snapshot authored predicates before font serialization changes inline styles,
	// media attributes, or emptiness. SVGs without local styles need no snapshot.
	const authoredElements =
		textElements.length > 0 && svg.querySelector('style')
			? [svg, ...svg.querySelectorAll('*')]
			: null;
	const authoredStyles =
		authoredElements?.map((element) => element.getAttribute('style')) ?? null;
	const authoredMedia =
		authoredElements?.map((element) => element.getAttribute('media')) ?? null;
	const authoredEmpty =
		authoredElements?.map((element) => element.matches(':empty')) ?? null;
	return {
		textStyles,
		authoredStyles,
		authoredMedia,
		authoredEmpty,
		cssFontRules,
		embeddedFontStyle,
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

	const usesStylesheetSets = Boolean(
		styles[fontStyleIndex]?.getAttribute('title')?.trim(),
	);
	// The first titled sheet selects the preferred set even when empty. Retain
	// fonts there without duplicating them across every empty titled stylesheet.
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
	if (hasFontCss) {
		for (const index of fontCarriers) {
			const carrier = styles[index];
			if (carrier?.sheet && !carrier.sheet.disabled) {
				// CSSOM rules can exist while the authored style still matches :empty.
				// Snapshot them before preserving the authored selector predicates.
				// End malformed comments before appending carried faces.
				svgForSerialization.querySelectorAll('style')[index].textContent =
					Array.from(carrier.sheet.cssRules, (rule) => rule.cssText).join('') ||
					'/* Empty stylesheet rules. */';
			}
		}
	}

	if (authoredStyles || authoredEmpty || authoredMedia)
		preserveSvgAttributeSelectors({
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

	const fontStyleKey = hasFontCss
		? JSON.stringify([
				embeddedFontStyle?.cacheKey ?? null,
				fontStyleIndex,
				fontCarriers.map((index) => {
					const media = styles[index]?.getAttribute('media');
					return [
						index,
						!media ||
							(svg.ownerDocument.defaultView ?? window).matchMedia(media)
								.matches,
					];
				}),
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
