import {
	DEFAULT_PROPS_PATH_ACTIVE_CLASSNAME,
	DEFAULT_PROPS_PATH_CLASSNAME,
} from '../components/RenderModal/SchemaEditor/scroll-to-default-props-path';
import type {JSONPath} from '../components/RenderModal/SchemaEditor/zod-types';

export const focusDefaultPropsPath = ({
	path,
	scrollBehavior,
}: {
	path: JSONPath;
	scrollBehavior?: ScrollBehavior;
}): {success: boolean} => {
	const currentlyActive = document.querySelector(
		`.${DEFAULT_PROPS_PATH_ACTIVE_CLASSNAME}`,
	);
	if (currentlyActive !== null) {
		currentlyActive.classList.remove(DEFAULT_PROPS_PATH_ACTIVE_CLASSNAME);
	}

	const query = document.querySelector(
		`.${DEFAULT_PROPS_PATH_CLASSNAME}[data-json-path="${path.join('.')}"]`,
	);
	if (query === null) {
		return {
			success: false,
		};
	}

	query.scrollIntoView({behavior: scrollBehavior});
	query.classList.add(DEFAULT_PROPS_PATH_ACTIVE_CLASSNAME);
	return {
		success: true,
	};
};
