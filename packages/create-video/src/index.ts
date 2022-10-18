import {FEATURED_TEMPLATES} from './templates';

export const CreateVideoInternals = {
	FEATURED_TEMPLATES,
};

export {Template} from './templates';

export default () => {
	throw new Error(
		'create-video is a CLI tool only. Run `npm init video`, `pnpm create video` or `yarn create video` instead!'
	);
};
