import {
	hasExcludedSvgStyleAtRule,
	rewriteSvgStyleHeaders,
} from './has-excluded-svg-style-at-rule';
import {preserveSvgAttributeSelectors} from './preserve-svg-style-selectors';

const scopeStylesIncludingRoot = (text: string, attribute: string) => {
	const sheet = new CSSStyleSheet();
	sheet.replaceSync(text);
	const namespaces = Array.from(sheet.cssRules)
		.filter((rule) => rule.type === CSSRule.NAMESPACE_RULE)
		.map((rule) => rule.cssText)
		.join('');
	const headerSheet = new CSSStyleSheet();
	// Rewrite headers only: canonical declaration text can lose authored
	// logical/physical ordering and pending custom-property shorthands.
	const rewritten = rewriteSvgStyleHeaders(text, (header) => {
		headerSheet.replaceSync(namespaces + header + '{}');
		const rule = Array.from(headerSheet.cssRules).at(-1);
		if (!(rule instanceof CSSStyleRule)) return header;
		const selectors: string[] = [];
		let start = 0;
		let depth = 0;
		let quote: string | null = null;
		let escaped = false;
		const selector = rule.selectorText.replace(
			/"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|\\[\s\S]|:root(?![\w-])/gi,
			(match) => (match.toLowerCase() === ':root' ? ':scope' : match),
		);
		for (let i = 0; i < selector.length; i++) {
			const char = selector[i]!;
			if (escaped) {
				escaped = false;
				continue;
			}

			if (char === '\\') {
				escaped = true;
				continue;
			}

			if (quote) {
				if (char === quote) quote = null;
				continue;
			}

			if (char === '"' || char === "'") {
				quote = char;
				continue;
			}

			if (char === '(' || char === '[') depth++;
			if (char === ')' || char === ']') depth--;
			if (char === ',' && depth === 0) {
				selectors.push(selector.slice(start, i).trim());
				start = i + 1;
			}
		}

		selectors.push(selector.slice(start).trim());
		// Keep the original root eligible without raising specificity, including
		// when another member of the selector list has a higher specificity.
		return selectors
			.flatMap((item) => [item, `:where(:scope):is(${item})`])
			.join(',');
	});
	return namespaces + `@scope ([${attribute}]) {` + rewritten + '}';
};

export const scopeSvgForRasterization = (svg: SVGSVGElement) => {
	const styles = Array.from(svg.querySelectorAll('style')).filter((style) => {
		const type = style.getAttribute('type')?.trim().toLowerCase();
		return !type || type === 'text/css';
	});
	if (styles.length === 0) return true;
	if (
		typeof CSSStyleSheet === 'undefined' ||
		typeof CSSStyleSheet.prototype.replaceSync !== 'function'
	)
		return false;
	if (
		styles.some((style) => hasExcludedSvgStyleAtRule(style.textContent ?? ''))
	)
		return false;
	const support = new CSSStyleSheet();
	support.replaceSync('@scope (svg) {}');
	if (support.cssRules[0]?.constructor.name !== 'CSSScopeRule') return false;
	const elements = [svg, ...svg.querySelectorAll('*')];
	preserveSvgAttributeSelectors({
		svg,
		authoredStyles: elements.map((element) => element.getAttribute('style')),
		authoredWidths: elements.map((element) => element.getAttribute('width')),
		authoredHeights: elements.map((element) => element.getAttribute('height')),
		authoredMedia: elements.map((element) => element.getAttribute('media')),
		authoredEmpty: elements.map((element) => element.matches(':empty')),
		preserveMediaQueries: true,
	});
	const text = styles
		.map((style) => style.textContent ?? '')
		.join('\n')
		.replace(
			/\\(?:([0-9a-f]{1,6})(?:\r\n|[\t\n\f\r ])?|([^\n\r\f]))/gi,
			(_match, hex: string | undefined, escaped: string | undefined) => {
				if (!hex) return escaped!;
				const value = Number.parseInt(hex, 16);
				return String.fromCodePoint(
					value === 0 ||
						value > 0x10ffff ||
						(value >= 0xd800 && value <= 0xdfff)
						? 0xfffd
						: value,
				);
			},
		);
	let attribute = 'data-remotion-raster-root';
	while (
		elements.some((element) =>
			Array.from(element.attributes).some(
				(attr) => attr.localName === attribute,
			),
		) ||
		text.includes(attribute)
	)
		attribute += '-';
	svg.setAttribute(attribute, '');
	for (const style of styles) {
		const original = style.textContent ?? '';
		const sheet = new CSSStyleSheet();
		sheet.replaceSync(original);
		// Empty titled sheets and standalone font registrations keep their original
		// CSSOM state. Only stylesheets with selectors need an element scope.
		const pending = Array.from(sheet.cssRules);
		let selectors = false;
		while (pending.length) {
			const rule = pending.pop()!;
			if (rule instanceof CSSStyleRule) {
				selectors = true;
				break;
			}

			if ('cssRules' in rule)
				pending.push(...Array.from((rule as CSSGroupingRule).cssRules));
		}

		if (selectors)
			style.textContent = scopeStylesIncludingRoot(original, attribute);
	}

	return true;
};
