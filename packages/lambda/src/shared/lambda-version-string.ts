import {VERSION} from 'remotion/version';

export const LAMBDA_VERSION_STRING = VERSION.replace(/\./g, '-').replace(
	/\+/g,
	'-'
);
