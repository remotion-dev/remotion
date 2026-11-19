import {
	rewriteSvgStyleHeaders,
	hasExcludedSvgStyleAtRule,
} from './has-excluded-svg-style-at-rule';

// Match authored attribute and emptiness predicates, skipping quoted values and escapes.
const attributeSelector =
	/"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|\\[\s\S]|\[([\t\n\f\r ]*(?:(?:\*\||\|)[\t\n\f\r ]*)?)(style|media|width|height)(?=[\t\n\f\r \]~^$*=]|\|=)|(:empty)(?![\w-])/g;

export const preserveSvgAttributeSelectors = ({
	svg,
	authoredStyles,
	authoredEmpty,
	authoredMedia,
	authoredWidths,
	authoredHeights,
	preserveMediaQueries,
}: {
	svg: SVGSVGElement;
	authoredStyles: (string | null)[] | null;
	authoredEmpty: boolean[] | null;
	authoredMedia: (string | null)[] | null;
	authoredWidths: (string | null)[] | null;
	authoredHeights: (string | null)[] | null;
	preserveMediaQueries: boolean;
}) => {
	const ownerWindow = svg.ownerDocument.defaultView ?? window;
	if (typeof ownerWindow.CSSStyleSheet.prototype.replaceSync !== 'function')
		return;
	const styles = Array.from(svg.querySelectorAll('style'));
	// Authored selectors may spell an attribute name using CSS escapes.
	const stylesheetText = styles
		.map((style) => style.textContent ?? '')
		.join('\n')
		.replace(
			/\\(?:([0-9a-f]{1,6})(?:\r\n|[\t\n\f\r ])?|([^\n\r\f]))/gi,
			(_match, hex: string | undefined, escaped: string | undefined) => {
				if (!hex) return escaped!;
				const codePoint = Number.parseInt(hex, 16);
				return String.fromCodePoint(
					codePoint === 0 ||
						codePoint > 0x10ffff ||
						(codePoint >= 0xd800 && codePoint <= 0xdfff)
						? 0xfffd
						: codePoint,
				);
			},
		);
	const attributes = [
		['style', authoredStyles],
		['media', authoredMedia],
		['width', authoredWidths],
		['height', authoredHeights],
	] as const;
	const aliases = attributes.map(([name, values]) => {
		let alias = `data-remotion-authored-${name}`;
		while (
			Array.from(svg.attributes).some(
				(original) => original.localName === alias,
			) ||
			svg.querySelector(`[*|${alias}]`) ||
			stylesheetText.includes(alias)
		)
			alias += '-';
		return {name, values, alias};
	});
	const attribute = aliases[0].alias;

	let emptyAttribute = `${attribute}-empty`;
	while (
		Array.from(svg.attributes).some(
			(original) => original.localName === emptyAttribute,
		) ||
		svg.querySelector(`[*|${emptyAttribute}]`) ||
		stylesheetText.includes(emptyAttribute)
	)
		emptyAttribute += '-';

	let changed = false;
	for (const style of styles) {
		const type = style.getAttribute('type')?.trim().toLowerCase();
		if (type && type !== 'text/css') continue;
		const text = style.textContent;
		// CSSOM canonicalizes pseudo-class case and escapes. Inspect potential
		// pseudo-classes before deciding whether the parsed selector needs rewriting.
		if (
			!text ||
			(!preserveMediaQueries &&
				!text.includes('[') &&
				!text.includes('\\') &&
				!/:empty/i.test(text))
		)
			continue;
		// Constructed sheets discard @import and do not expose writable @scope selectors.
		if (hasExcludedSvgStyleAtRule(text)) continue;
		const sheet = new ownerWindow.CSSStyleSheet();
		sheet.replaceSync(text);

		const media = style.getAttribute('media');
		if (preserveMediaQueries && media) {
			style.setAttribute(
				'media',
				ownerWindow.matchMedia(media).matches ? 'all' : 'not all',
			);
			changed = true;
		}

		const namespaces = Array.from(sheet.cssRules)
			.filter((rule) => rule.type === CSSRule.NAMESPACE_RULE)
			.map((rule) => rule.cssText)
			.join('');
		const headerSheet = new ownerWindow.CSSStyleSheet();
		const rewritten = rewriteSvgStyleHeaders(text, (header) => {
			headerSheet.replaceSync(`${namespaces}${header}{}`);
			const rule = Array.from(headerSheet.cssRules).at(-1);
			if (preserveMediaQueries && rule instanceof ownerWindow.CSSMediaRule) {
				return `@media ${ownerWindow.matchMedia(rule.conditionText).matches ? 'all' : 'not all'} `;
			}

			if (!(rule instanceof ownerWindow.CSSStyleRule)) return header;
			const selector = rule.selectorText.replace(
				attributeSelector,
				(
					match,
					prefix: string | undefined,
					name: string | undefined,
					empty: string | undefined,
				) => {
					if (empty && authoredEmpty) return `[${emptyAttribute}]`;
					if (prefix === undefined) return match;
					const original = aliases.find((entry) => entry.name === name);
					return original?.values ? `[${prefix}${original.alias}` : match;
				},
			);
			return selector === rule.selectorText ? header : selector;
		});
		if (rewritten !== text) {
			style.textContent = rewritten;
			changed = true;
		}
	}

	if (!changed) return;
	[svg, ...svg.querySelectorAll('*')].forEach((element, index) => {
		if (authoredEmpty?.[index]) element.setAttribute(emptyAttribute, '');
		for (const {name, values, alias} of aliases) {
			if (!values) continue;
			const value = values[index];
			if (value !== null) element.setAttribute(alias, value);
			for (const original of Array.from(element.attributes)) {
				if (original.localName !== name || original.namespaceURI === null)
					continue;
				element.setAttributeNS(
					original.namespaceURI,
					original.prefix ? `${original.prefix}:${alias}` : alias,
					original.value,
				);
			}
		}
	});
};
