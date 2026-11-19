import {
	getSvgStyleDeclarations,
	hasExcludedSvgStyleAtRule,
} from './has-excluded-svg-style-at-rule';

// Match authored attribute and emptiness predicates, skipping quoted values and escapes.
const attributeSelector =
	/"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|\\[\s\S]|\[([\t\n\f\r ]*(?:(?:\*\||\|)[\t\n\f\r ]*)?)(style|media|width|height)(?=[\t\n\f\r \]~^$*=]|\|=)|(:empty)(?![\w-])/g;

const serializeSvgDeclarations = (
	style: CSSStyleDeclaration,
	scratch: CSSStyleDeclaration,
): string => {
	const properties = Array.from(style);
	// Native property order retains physical overrides that cssText can fold
	// into an earlier shorthand across an intervening logical declaration.
	const pending = new Map<string, string>();
	if (
		properties.some(
			(property) =>
				!property.startsWith('--') && !style.getPropertyValue(property),
		)
	) {
		// Pending var() shorthands have empty longhand values. Keep their opaque
		// declaration instead of dropping them or resolving against mounted DOM.
		for (const declaration of getSvgStyleDeclarations(style.cssText)) {
			scratch.cssText = declaration;
			for (const property of Array.from(scratch)) {
				if (!scratch.getPropertyValue(property))
					pending.set(property, declaration);
			}
		}
	}

	const emitted = new Set<string>();
	const declarations: string[] = [];
	for (const property of properties) {
		const value = style.getPropertyValue(property);
		if (!value && !property.startsWith('--')) {
			const declaration = pending.get(property);
			if (!declaration) return style.cssText;
			if (!emitted.has(declaration)) declarations.push(declaration);
			emitted.add(declaration);
			continue;
		}

		declarations.push(
			`${property}: ${value}${style.getPropertyPriority(property) ? ' !important' : ''};`,
		);
	}

	return declarations.join(' ');
};

const serializeSvgStyleRule = (
	rule: CSSRule,
	scratch: CSSStyleDeclaration,
): string => {
	const style = 'style' in rule ? (rule.style as CSSStyleDeclaration) : null;
	const expanded = style ? serializeSvgDeclarations(style, scratch) : null;
	// CSSNestedDeclarations has a declaration list without an outer block.
	// Custom-property values can contain braces, so detect it before scanning.
	if (style && rule.cssText === style.cssText) return expanded ?? rule.cssText;
	const children =
		'cssRules' in rule ? Array.from(rule.cssRules as CSSRuleList) : [];
	const serializedChildren = children.map((child) =>
		serializeSvgStyleRule(child, scratch),
	);
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

		let rewritten = false;
		const visit = (rules: CSSRuleList) => {
			for (const rule of rules) {
				if (preserveMediaQueries && rule instanceof ownerWindow.CSSMediaRule) {
					const resolvedMedia = ownerWindow.matchMedia(rule.conditionText)
						.matches
						? 'all'
						: 'not all';
					if (rule.media.mediaText !== resolvedMedia) {
						rule.media.mediaText = resolvedMedia;
						rewritten = true;
					}
				}

				if (rule instanceof ownerWindow.CSSStyleRule) {
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
			const scratch = svg.ownerDocument.createElement('div').style;
			style.textContent = Array.from(sheet.cssRules, (rule) =>
				serializeSvgStyleRule(rule, scratch),
			).join('');
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
