import type {CodemodProject} from './codemod-project';
import {type AddContentOptions, insertContent} from './insert-content';
import {type CodemodInsertionResult} from './node-references';

export type AddMediaOptions<Project extends CodemodProject> =
	AddContentOptions<Project> & {
		type: 'image' | 'video' | 'audio' | 'gif' | 'animated-image';
		src: string;
		srcType: 'static' | 'remote';
		dimensions?: {width: number; height: number};
	};

export const addMedia = <Project extends CodemodProject>({
	type,
	src,
	srcType,
	dimensions,
	...options
}: AddMediaOptions<Project>): Promise<CodemodInsertionResult<Project>> => {
	if (
		dimensions &&
		(!Number.isFinite(dimensions.width) ||
			dimensions.width <= 0 ||
			!Number.isFinite(dimensions.height) ||
			dimensions.height <= 0)
	) {
		throw new Error('Media dimensions must be positive finite numbers');
	}

	return insertContent({
		...options,
		element: {
			type: 'asset',
			assetType: type,
			src,
			srcType,
			dimensions: dimensions ?? null,
			durationInFrames: null,
			position: null,
		},
	});
};
