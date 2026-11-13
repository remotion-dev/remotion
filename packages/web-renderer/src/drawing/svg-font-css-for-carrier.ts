export const getSvgFontCssForCarrier = ({
	rules,
	title,
	registeredCss,
}: {
	rules: readonly {css: string; localTitle: string | null}[];
	title: string | null;
	registeredCss: string | null;
}) => {
	const hasLocalTitledFaces = rules.some((rule) => rule.localTitle !== null);
	// Preserve authored set ownership and declaration order. Untitled carriers
	// keep their existing local rules when titled sets carry the CSS snapshot.
	const css = rules
		.filter(
			(rule) =>
				!(hasLocalTitledFaces && title === null) &&
				(rule.localTitle === null || rule.localTitle === title),
		)
		.map((rule) => rule.css)
		.join('');
	// Script-added faces follow all CSS-connected faces in FontFaceSet order.
	return css + (registeredCss ?? '');
};
