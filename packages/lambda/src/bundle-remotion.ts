import {bundle} from '@remotion/bundler';
import path from 'path';

export const bundleRemotion = () => {
	return bundle(
		path.join(__dirname, '..', 'remotion-project', 'index.ts'),
		() => undefined,
		{
			enableCaching: false,
		}
	);
};
