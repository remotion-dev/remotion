import type {OutputContainer} from '~/seo';
import type {Source} from './convert-state';

export const generateOutputFilename = (
	source: Source,
	container: OutputContainer,
) => {
	const filename =
		typeof source === 'string'
			? source
			: source instanceof File
				? source.name
				: 'converted';
	const behindSlash = filename.split('/').pop()!;
	const withoutExtension = behindSlash.split('.').slice(0, -1).join('.');
	return `${withoutExtension}.${container}`;
};
