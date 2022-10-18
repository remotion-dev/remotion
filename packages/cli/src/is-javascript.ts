const isJavascript = (fullPath: string): boolean => {
	const splitFullPath = fullPath.split('.');
	const extension = splitFullPath[splitFullPath.length - 1];

	return extension === 'jsx' || extension === 'js';
};

export {isJavascript};
