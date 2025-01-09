import {bundle} from '@remotion/bundler';
import type {FullClientSpecifics} from '@remotion/serverless';

export const awsFullClientSpecifics: FullClientSpecifics = {
	bundleSite: bundle,
	id: '__remotion_full_client_specifics',
};
