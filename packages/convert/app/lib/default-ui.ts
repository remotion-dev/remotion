import {RouteAction} from '~/seo';

export const isConvertEnabledByDefault = (action: RouteAction) => {
	if (action.type === 'convert') {
		return true;
	}

	if (action.type === 'generic-convert') {
		return true;
	}

	if (action.type === 'generic-rotate') {
		return false;
	}

	throw new Error(
		'Convert is not enabled by default ' + (action satisfies never),
	);
};
