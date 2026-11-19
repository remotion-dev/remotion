import {hasExcludedSvgStyleAtRule} from './has-excluded-svg-style-at-rule';

// Match authored attribute and emptiness predicates, skipping quoted values and escapes.
const attributeSelector =
	/"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|\\[\s\S]|\[([\t\n\f\r ]*(?:(?:\*\||\|)[\t\n\f\r ]*)?)(style|media)(?=[\t\n\f\r \]~^$*=]|\|=)|(:empty)(?![\w-])/g;

const cornerLonghands = [
	'top-left',
	'top-right',
	'bottom-right',
	'bottom-left',
].flatMap((corner) => [`border-${corner}-radius`, `corner-${corner}-shape`]);

export const expandSvgCornerStyle = (
	style: CSSStyleDeclaration,
): string | null => {
	if (
		!/(?:^|;)\s*corner\s*:/.test(style.cssText) ||
		cornerLonghands.some((property) => !style.getPropertyValue(property))
	)
		return null;
	const text = style.cssText;
	const longhands = cornerLonghands
		.map(
			(property) =>
				`${property}: ${style.getPropertyValue(property)}${style.getPropertyPriority(property) ? ' !important' : ''};`,
		)
		.join(' ');
	// WebKit emits a folded declaration that its parser may not accept again.
	// Replace that declaration in place, preserving later logical overrides.
	let start = 0;
	let depth = 0;
	let quote: string | null = null;
	let comment = false;
	for (let index = 0; index < text.length; index++) {
		const char = text[index];
		if (comment) {
			if (char === '*' && text[index + 1] === '/') {
				comment = false;
				index++;
			}

			continue;
		}

		if (char === '\\') {
			index++;
			continue;
		}

		if (quote !== null) {
			if (char === quote) quote = null;
			continue;
		}

		if (char === '"' || char === "'") quote = char;
		else if (char === '/' && text[index + 1] === '*') {
			comment = true;
			index++;
		} else if (char === '(' || char === '[' || char === '{') depth++;
		else if (char === ')' || char === ']' || char === '}') depth--;
		else if (char === ';' && depth === 0) {
			if (/^\s*corner\s*:/.test(text.slice(start, index + 1))) {
				return `${text.slice(0, start)} ${longhands}${text.slice(index + 1)}`;
			}

			start = index + 1;
		}
	}

	return null;
};

const serializeSvgStyleRule = (rule: CSSRule): string => {
	const style = 'style' in rule ? (rule.style as CSSStyleDeclaration) : null;
	const expanded = style ? expandSvgCornerStyle(style) : null;
	// CSSNestedDeclarations has a declaration list without an outer block.
	// Custom-property values can contain braces, so detect it before scanning.
	if (style && rule.cssText === style.cssText) return expanded ?? rule.cssText;
	const children =
		'cssRules' in rule ? Array.from(rule.cssRules as CSSRuleList) : [];
	const serializedChildren = children.map(serializeSvgStyleRule);
	if (
		expanded === null &&
		serializedChildren.every(
			(serialized, index) => serialized === children[index].cssText,
		)
	)
		return rule.cssText;

	// Locate the declaration block without treating braces inside a quoted
	// selector, escaped identifier or grouping condition as its opening brace.
	const text = rule.cssText;
	let quote: string | null = null;
	let comment = false;
	let depth = 0;
	let opening = -1;
	for (let index = 0; index < text.length; index++) {
		const char = text[index];
		if (comment) {
			if (char === '*' && text[index + 1] === '/') {
				comment = false;
				index++;
			}

			continue;
		}

		if (char === '\\') {
			index++;
			continue;
		}

		if (quote !== null) {
			if (char === quote) quote = null;
			continue;
		}

		if (char === '"' || char === "'") quote = char;
		else if (char === '/' && text[index + 1] === '*') {
			comment = true;
			index++;
		} else if (char === '(' || char === '[') depth++;
		else if (char === ')' || char === ']') depth--;
		else if (char === '{' && depth === 0) {
			opening = index;
			break;
		}
	}

	// Nested declaration rules have no surrounding block of their own.
	if (opening === -1) return expanded ?? text;
	return `${text.slice(0, opening + 1)} ${expanded ?? style?.cssText ?? ''} ${serializedChildren.join(' ')} }`;
};

export const preserveSvgAttributeSelectors = ({
	svg,
	authoredStyles,
	authoredEmpty,
	authoredMedia,
}: {
	svg: SVGSVGElement;
	authoredStyles: (string | null)[] | null;
	authoredEmpty: boolean[] | null;
	authoredMedia: (string | null)[] | null;
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
	let attribute = 'data-remotion-authored-style';
	while (
		Array.from(svg.attributes).some(
			(original) => original.localName === attribute,
		) ||
		svg.querySelector(`[*|${attribute}]`) ||
		stylesheetText.includes(attribute)
	) {
		attribute += '-';
	}

	let mediaAttribute = 'data-remotion-authored-media';
	while (
		Array.from(svg.attributes).some(
			(original) => original.localName === mediaAttribute,
		) ||
		svg.querySelector(`[*|${mediaAttribute}]`) ||
		stylesheetText.includes(mediaAttribute)
	)
		mediaAttribute += '-';

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
			(!text.includes('[') && !text.includes('\\') && !/:empty/i.test(text))
		)
			continue;
		// Constructed sheets discard @import and do not expose writable @scope selectors.
		if (hasExcludedSvgStyleAtRule(text)) continue;
		const sheet = new ownerWindow.CSSStyleSheet();
		sheet.replaceSync(text);
		let rewritten = false;
		const visit = (rules: CSSRuleList) => {
			for (const rule of rules) {
				if (rule instanceof ownerWindow.CSSStyleRule) {
					const selector = rule.selectorText.replace(
						attributeSelector,
						(
							match,
							prefix: string | undefined,
							name: string | undefined,
							empty: string | undefined,
						) =>
							empty && authoredEmpty
								? `[${emptyAttribute}]`
								: prefix !== undefined && name === 'style' && authoredStyles
									? `[${prefix}${attribute}`
									: prefix !== undefined && name === 'media' && authoredMedia
										? `[${prefix}${mediaAttribute}`
										: match,
					);
					if (selector !== rule.selectorText) {
						rule.selectorText = selector;
						rewritten = true;
					}
				}

				if ('cssRules' in rule) visit(rule.cssRules as CSSRuleList);
			}
		};

		visit(sheet.cssRules);
		if (rewritten) {
			style.textContent = Array.from(
				sheet.cssRules,
				serializeSvgStyleRule,
			).join('');
			changed = true;
		}
	}

	if (!changed) return;
	[svg, ...svg.querySelectorAll('*')].forEach((element, index) => {
		if (authoredEmpty?.[index]) element.setAttribute(emptyAttribute, '');
		for (const [name, values, alias] of [
			['style', authoredStyles, attribute],
			['media', authoredMedia, mediaAttribute],
		] as const) {
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
