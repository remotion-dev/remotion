import {listOfRemotionPackages} from './list-of-remotion-packages';
import {FEATURED_TEMPLATES} from './templates';

export const CreateVideoInternals = {
	FEATURED_TEMPLATES,
	listOfRemotionPackages,
};

export {Template} from './templates';

export default () => {
	throw new Error(
		'create-video is a CLI tool only. Run `npx create-video@latest`, `pnpm create video` or `yarn create video` instead!',
	);
};
