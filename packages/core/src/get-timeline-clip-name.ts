export const getTimelineClipName = (children: any, i = 0): string => {
	const arrays = Array.isArray(children) ? children : [children];
	const tree = arrays.map((ch) => {
		// Must be name, not ID
		const name = ch?.type?.name;
		if (!name) {
			return null;
		}
		const root = '  '.repeat(i) + name;
		if (ch.props.children) {
			const chName = getTimelineClipName(children.props.children, i + 1);
			return [root, chName].join('\n');
		}
		return root;
	});
	return tree.filter(Boolean).join('\n');
};
