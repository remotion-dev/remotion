import {FEATURED_TEMPLATES} from './templates';

export const CreateVideoInternals = {
	FEATURED_TEMPLATES,
};

export {Template} from './templates';

export default () => {
	throw new Error(
		'create-video is a CLI tool only. Run `yarn create video` or `npm init video` instead!'
	);
};
