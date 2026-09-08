import {extraPackages} from '@remotion/studio-shared';

export const EXTRA_PACKAGES: Record<string, string> = {
	...Object.fromEntries(
		extraPackages.map(({name, version}) => [name, version]),
	),
	'@mediabunny/mp3-encoder': '1.55.5',
	'@mediabunny/aac-encoder': '1.55.5',
	'@mediabunny/flac-encoder': '1.55.5',
};

export const EXTRA_PACKAGES_DOCS: Record<string, string> = {
	...Object.fromEntries(
		extraPackages.map(({name, versionDocsUrl}) => [name, versionDocsUrl]),
	),
	'@mediabunny/mp3-encoder': 'https://www.remotion.dev/docs/mediabunny/version',
	'@mediabunny/aac-encoder': 'https://www.remotion.dev/docs/mediabunny/version',
	'@mediabunny/flac-encoder':
		'https://www.remotion.dev/docs/mediabunny/version',
};
