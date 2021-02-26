import {Children, isValidElement} from 'react';

export const getTimelineClipName = (
	children: React.ReactNode,
	i = 0
): string => {
	const tree = Children.map(children, (ch) => {
		if (!isValidElement(ch)) return '';
		// Must be name, not ID
		const name = typeof ch.type !== 'string' && ch.type.name;
		const root = name ? '  '.repeat(i) + name : null;
		if (ch.props.children) {
			const chName = getTimelineClipName(ch.props.children, i + 1);
			return [root, chName].filter(Boolean).join('\n');
		}
		return root;
	});
	return tree ? tree.filter(Boolean).join('\n') : '';
};
