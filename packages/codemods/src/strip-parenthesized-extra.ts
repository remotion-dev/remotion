// When a node was originally parenthesized (e.g. the `<JSX/>` inside
// `return (<JSX/>)`), Babel records `extra.parenthesized` on it. If we move
// such a node into a new JSX parent without clearing that hint, recast prints
// stray `(` / `)` characters around it as JSX text.
export const stripParenthesizedExtra = <T extends object>(node: T): T => {
	const {extra} = node as {extra?: unknown};
	if (!extra) {
		return node;
	}

	const {
		parenthesized: _p,
		parenStart: _ps,
		...rest
	} = extra as {
		parenthesized?: boolean;
		parenStart?: number;
	};
	return {...node, extra: rest};
};
