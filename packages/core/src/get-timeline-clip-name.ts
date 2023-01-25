import {Children, isValidElement} from 'react';

const HIDDEN_NAMES = ['__WEBPACK_DEFAULT_EXPORT__'];

export const getTimelineClipName = (children: React.ReactNode): string => {
	const tree = Children.map(children, (ch) => {
		if (!isValidElement(ch)) {
			return null;
		}

		// Must be name, not ID
		const name = typeof ch.type !== 'string' && ch.type.name;
		if (name && !HIDDEN_NAMES.includes(name)) {
			return name;
		}

		if (ch.props.children) {
			const chName = getTimelineClipName(ch.props.children);
			return chName;
		}

		return null;
	})?.filter(Boolean);
	return tree?.length ? tree[0] : '';
};
