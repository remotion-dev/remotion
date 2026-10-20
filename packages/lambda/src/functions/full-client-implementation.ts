import {bundle} from '@remotion/bundler';
import {createFunction} from '../api/create-function';
import {uploadDir} from '../api/upload-dir';
import {readDirectory} from '../shared/read-dir';
import type {FullClientSpecifics} from './provider-implementation';

export const awsFullClientSpecifics: FullClientSpecifics = {
	bundleSite: bundle,
	id: '__remotion_full_client_specifics',
	readDirectory,
	uploadDir,
	createFunction,
};
