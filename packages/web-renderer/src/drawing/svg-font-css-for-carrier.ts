export const getSvgFontCssForCarrier = ({
	rules,
	title,
	index,
	registeredCss,
}: {
	rules: readonly {
		css: string;
		localTitle: string | null;
		localStyleIndex: number | null;
	}[];
	title: string | null;
	index: number;
	registeredCss: string | null;
}) => {
	const hasLocalTitledFaces = rules.some((rule) => rule.localTitle !== null);
	// An untitled sheet retains its own faces. Replay only persistent faces
	// following that sheet, so it cannot override a later external declaration
	// already carried by an earlier titled sheet, or promote an earlier face.
	let firstRule = 0;
	if (hasLocalTitledFaces && title === null) {
		firstRule = rules.length;
		for (let i = rules.length - 1; i >= 0; i--) {
			if (rules[i].localStyleIndex === index) {
				firstRule = i + 1;
				break;
			}
		}
	}

	const css = rules
		.slice(firstRule)
		.filter((rule) => rule.localTitle === null || rule.localTitle === title)
		.map((rule) => rule.css)
		.join('');
	// Script-added faces follow all CSS-connected faces in FontFaceSet order.
	return css + (registeredCss ?? '');
};
