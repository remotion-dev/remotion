export const getTimelineClipName = (children: any, i = 0): string => {
	const arrays = Array.isArray(children) ? children : [children];
	const tree = arrays.map((ch) => {
		const root = ('  '.repeat(i) + ch?.type?.name) as string;
		if (ch.props.children) {
			const chName = getTimelineClipName(children.props.children, i + 1);
			return [root, chName].join('\n');
		} else {
			return root;
		}
	});
	return tree.join('\n');
};
