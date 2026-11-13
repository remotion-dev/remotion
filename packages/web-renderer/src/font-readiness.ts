import {parseFontFamilies} from './drawing/parse-font-families';
import {withScaffoldVisible} from './drawing/with-scaffold-visible';

export type FontReadinessStyle = Pick<
	CSSStyleDeclaration,
	'fontFamily' | 'fontSize' | 'fontStyle' | 'fontWeight' | 'fontStretch'
>;
type FontReadinessContext = FontReadinessStyle &
	Pick<CSSStyleDeclaration, 'fill' | 'stroke' | 'visibility'>;
export type FontReadinessSample = {
	text: string;
	style: FontReadinessStyle;
	font: string;
};

const stretchKeywords: Record<string, string> = {
	'50%': 'ultra-condensed',
	'62.5%': 'extra-condensed',
	'75%': 'condensed',
	'87.5%': 'semi-condensed',
	'100%': 'normal',
	'112.5%': 'semi-expanded',
	'125%': 'expanded',
	'150%': 'extra-expanded',
	'200%': 'ultra-expanded',
};
export const getFontReadinessQuery = (style: FontReadinessStyle) =>
	style.fontStyle +
	' ' +
	style.fontWeight +
	' ' +
	(stretchKeywords[style.fontStretch] ?? style.fontStretch) +
	' ' +
	style.fontSize +
	' ' +
	style.fontFamily;

const properties = [
	['fontFamily', 'font-family'],
	['fontSize', 'font-size'],
	['fontStyle', 'font-style'],
	['fontWeight', 'font-weight'],
	['fontStretch', 'font-stretch'],
	['fill', 'fill'],
	['stroke', 'stroke'],
	['visibility', 'visibility'],
] as const;
const definitions =
	'defs, symbol, pattern, mask, clipPath, marker, filter, linearGradient, radialGradient';
const invalidUseTargets =
	'defs, pattern, mask, clipPath, marker, filter, linearGradient, radialGradient';

// Read the authored subtree with the incumbent scaffold visibility boundary.
// No font is loaded, fingerprinted or registered and authored nodes are untouched.
export const getFontReadinessSamples = (
	root: HTMLElement | SVGElement,
): FontReadinessSample[] =>
	withScaffoldVisible(root, () => {
		const owner = root.ownerDocument;
		const view = owner.defaultView;
		if (!view) return [];
		const styles = new WeakMap<Element, CSSStyleDeclaration>();
		const styleFor = (element: Element) => {
			let style = styles.get(element);
			if (!style) {
				style = view.getComputedStyle(element);
				styles.set(element, style);
			}

			return style;
		};

		const snapshot = (style: FontReadinessContext): FontReadinessContext => ({
			fontFamily: style.fontFamily,
			fontSize: style.fontSize,
			fontStyle: style.fontStyle,
			fontWeight: style.fontWeight,
			fontStretch: style.fontStretch,
			fill: style.fill,
			stroke: style.stroke,
			visibility: style.visibility,
		});
		const ownFontProperties = new WeakMap<Element, Set<string>>();
		const ownProperties = (element: Element) => {
			let own = ownFontProperties.get(element);
			if (own) return own;
			own = new Set<string>();
			const inline = (element as HTMLElement | SVGElement).style;
			for (const [, css] of properties) {
				const value =
					inline?.getPropertyValue(css) || element.getAttribute(css);
				if (value && value !== 'inherit' && value !== 'unset') own.add(css);
			}

			const collect = (rules: CSSRuleList) => {
				for (const rule of rules) {
					if (rule instanceof view.CSSStyleRule) {
						let matches = false;
						try {
							matches = element.matches(rule.selectorText);
						} catch {
							/* Unsupported selector does not supply an inherited override. */
						}

						if (matches)
							for (const [, css] of properties) {
								const value = rule.style.getPropertyValue(css);
								if (value && value !== 'inherit' && value !== 'unset')
									own!.add(css);
							}
					} else if (rule instanceof view.CSSMediaRule) {
						if (view.matchMedia(rule.conditionText).matches)
							collect(rule.cssRules);
					} else if (rule instanceof view.CSSSupportsRule) {
						if (view.CSS.supports(rule.conditionText)) collect(rule.cssRules);
					} else if ('cssRules' in rule)
						collect((rule as CSSGroupingRule).cssRules);
				}
			};

			for (const sheet of owner.styleSheets) {
				if (
					sheet.disabled ||
					(sheet.media.mediaText &&
						!view.matchMedia(sheet.media.mediaText).matches)
				)
					continue;
				try {
					collect(sheet.cssRules);
				} catch (error) {
					if (
						!(error instanceof view.DOMException) ||
						error.name !== 'SecurityError'
					)
						throw error;
				}
			}

			ownFontProperties.set(element, own);
			return own;
		};

		const reference = (element: Element, value: string) => {
			let svg = element.closest('svg');
			if (!svg) return null;
			while (svg.ownerSVGElement) svg = svg.ownerSVGElement;
			try {
				const documentUrl = new URL(owner.URL);
				// Initial about documents use an inherited base for resolved SVG URLs.
				if (
					documentUrl.protocol === 'about:' &&
					(documentUrl.pathname === 'blank' ||
						documentUrl.pathname === 'srcdoc')
				)
					documentUrl.href = owner.baseURI;
				documentUrl.hash = '';
				const url = new URL(value, element.baseURI);
				const id = decodeURIComponent(url.hash.slice(1));
				url.hash = '';
				return url.href === documentUrl.href ? svg.getElementById(id) : null;
			} catch {
				return null;
			}
		};

		const paintCache = new WeakMap<Element, boolean>();
		const hasPaint = (element: Element) => {
			const cached = paintCache.get(element);
			if (cached !== undefined) return cached;
			const seen = new Set<Element>();
			const queue = [element];
			for (let index = 0; index < queue.length; index++) {
				const candidate = queue[index]!;
				if (seen.has(candidate) || styleFor(candidate).display === 'none')
					continue;
				seen.add(candidate);
				if (
					styleFor(candidate).visibility !== 'hidden' &&
					styleFor(candidate).visibility !== 'collapse' &&
					(candidate.matches(
						'rect, circle, ellipse, path, polygon, polyline, line, image, foreignObject',
					) ||
						(candidate.matches('text, tspan, textPath') &&
							candidate.textContent?.trim()))
				) {
					paintCache.set(element, true);
					return true;
				}

				if (candidate.localName === 'use') {
					const target = reference(
						candidate,
						(candidate as SVGUseElement).href.baseVal,
					);
					if (target && !target.matches(invalidUseTargets)) queue.push(target);
				}

				for (const child of candidate.children)
					if (!child.matches(definitions)) queue.push(child);
			}

			paintCache.set(element, false);
			return false;
		};

		const samples = new Map<string, FontReadinessSample>();
		const visited = new WeakMap<Element, Set<string>>();
		const pending: {
			element: Element;
			inherited: FontReadinessContext | null;
			resource: boolean;
			withinText: boolean;
		}[] = [
			{element: root, inherited: null, withinText: false, resource: false},
		];
		for (let index = 0; index < pending.length; index++) {
			const {element, inherited, withinText, resource} = pending[index]!;
			const computed = styleFor(element);
			if (
				(computed.display === 'none' && !resource) ||
				element.matches('style, script, noscript, template')
			)
				continue;
			const isSvg = element.namespaceURI === 'http://www.w3.org/2000/svg';
			const style = snapshot(computed);
			if (inherited) {
				const own = ownProperties(element);
				for (const [key, css] of properties) {
					if (!own.has(css)) style[key] = inherited[key];
				}
			}

			const context =
				(inherited
					? getFontReadinessQuery(style) +
						':' +
						style.fill +
						':' +
						style.stroke +
						':' +
						style.visibility
					: '') +
				':' +
				withinText;
			let seen = visited.get(element);
			if (!seen) {
				seen = new Set();
				visited.set(element, seen);
			}

			if (seen.has(context)) continue;
			seen.add(context);
			const text =
				withinText || (isSvg && element.matches('text, tspan, textPath'));
			if (
				(!isSvg || text) &&
				style.visibility !== 'hidden' &&
				style.visibility !== 'collapse'
			)
				for (const node of element.childNodes) {
					if (
						(node.nodeType === Node.TEXT_NODE ||
							node.nodeType === Node.CDATA_SECTION_NODE) &&
						node.textContent?.trim()
					) {
						const font = getFontReadinessQuery(style);
						const sample = {text: node.textContent, style, font};
						samples.set(font + '\0' + sample.text, sample);
					}
				}

			if (isSvg && element.localName === 'use') {
				const use = element as SVGUseElement;
				const target = reference(element, use.href.baseVal);
				if (target && !target.matches(invalidUseTargets))
					pending.push({
						element: target,
						inherited: style,
						withinText: text,
						resource: false,
					});
			} else if (
				isSvg &&
				element.matches(
					'pattern, linearGradient, radialGradient, filter, feImage',
				)
			) {
				const href =
					element.getAttribute('href') ??
					element.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
				if (href) {
					const target = reference(element, href);
					if (
						target &&
						(element.localName === 'feImage'
							? !target.matches(invalidUseTargets)
							: target.localName === element.localName)
					)
						pending.push({
							element: target,
							inherited: null,
							withinText: false,
							resource: true,
						});
				}
			}

			if (isSvg)
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
					if (
						(property === 'fill' || property === 'stroke') &&
						(style.visibility === 'hidden' || style.visibility === 'collapse')
					)
						continue;
					if (
						(property === 'fill' || property === 'stroke') &&
						!element.matches(
							property === 'stroke'
								? 'rect, circle, ellipse, path, polygon, polyline, line, text, tspan, textPath'
								: 'rect, circle, ellipse, path, polygon, polyline, text, tspan, textPath',
						)
					)
						continue;
					if (
						(property === 'mask-image' || property === 'clip-path') &&
						!hasPaint(element)
					)
						continue;
					for (const match of (property === 'fill' || property === 'stroke'
						? style[property]
						: computed.getPropertyValue(property)
					).matchAll(/url\((?:"([^"\\]*)"|'([^'\\]*)'|([^()\\]*))\)/g)) {
						const target = reference(element, match[1] ?? match[2] ?? match[3]);
						if (target?.matches(allowed))
							pending.push({
								element: target,
								inherited: null,
								withinText: false,
								resource: true,
							});
					}
				}

			for (const child of element.children) {
				if (
					child.namespaceURI === 'http://www.w3.org/2000/svg' &&
					child.matches(definitions)
				)
					continue;
				pending.push({
					element: child,
					inherited: inherited ? style : null,
					withinText: text,
					resource: false,
				});
			}
		}

		return [...samples.values()];
	});

export const fontReadinessFamilies = (sample: FontReadinessSample) =>
	parseFontFamilies(sample.style.fontFamily);
