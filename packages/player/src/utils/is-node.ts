export const IS_NODE =
	typeof process !== 'undefined' &&
	process.versions !== null &&
	process.versions.node !== null;
