import {bundle} from '@remotion/bundler';
import type {AwsProvider} from '@remotion/lambda-client';
import type {FullClientSpecifics} from '@remotion/serverless';
import {createFunction} from '../api/create-function';
import {uploadDir} from '../api/upload-dir';
import {readDirectory} from '../shared/read-dir';

export const awsFullClientSpecifics: FullClientSpecifics<AwsProvider> = {
	bundleSite: bundle,
	id: '__remotion_full_client_specifics',
	readDirectory,
	uploadDir,
	createFunction,
};
