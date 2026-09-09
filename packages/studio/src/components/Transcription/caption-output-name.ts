import {
	getDefaultOutputBaseName,
	validatePublicOutputName,
} from '../public-output-name';

export const getDefaultCaptionOutputName = (
	src: string,
	displayName = 'captions',
): string => {
	return `${getDefaultOutputBaseName(src, displayName, 'captions')}-captions.json`;
};

export const validateCaptionOutputName = (outName: string): string | null =>
	validatePublicOutputName({extension: '.json', outName});
