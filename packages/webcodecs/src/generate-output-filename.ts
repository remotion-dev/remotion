import type {ConvertMediaContainer} from './get-available-containers';

export const generateOutputFilename = (
	source: string | Blob,
	container: ConvertMediaContainer,
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
