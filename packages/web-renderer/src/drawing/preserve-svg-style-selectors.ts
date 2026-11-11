import {hasExcludedSvgStyleAtRule} from './has-excluded-svg-style-at-rule';

// Match attribute names in selector text, skipping quoted values and escapes.
const attributeSelector =
	/"(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|\\[\s\S]|\[([\t\n\f\r ]*(?:\|[\t\n\f\r ]*)?)style(?=[\t\n\f\r \]~^$*=]|\|=)/g;

export const preserveSvgStyleSelectors = ({
	svg,
	authoredStyles,
}: {
	svg: SVGSVGElement;
	authoredStyles: (string | null)[];
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
		svg.hasAttribute(attribute) ||
		svg.querySelector(`[${attribute}]`) ||
		stylesheetText.includes(attribute)
	) {
		attribute += '-';
	}

	let changed = false;
	for (const style of styles) {
		const type = style.getAttribute('type')?.trim().toLowerCase();
		if (type && type !== 'text/css') continue;
		const text = style.textContent;
		if (!text?.includes('[')) continue;
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
						(match, prefix: string | undefined) =>
							prefix === undefined ? match : `[${prefix}${attribute}`,
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
				(rule) => rule.cssText,
			).join('');
			changed = true;
		}
	}

	if (!changed) return;
	[svg, ...svg.querySelectorAll('*')].forEach((element, index) => {
		const value = authoredStyles[index];
		if (value !== null) element.setAttribute(attribute, value);
	});
};
