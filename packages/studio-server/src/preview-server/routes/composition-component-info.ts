import type {
	CompositionComponentInfoRequest,
	CompositionComponentInfoResponse,
} from '@remotion/studio-shared';
import {resolveCompositionComponent} from '../../helpers/resolve-composition-component';
import type {ApiHandler} from '../api-types';

export const compositionComponentInfoHandler: ApiHandler<
	CompositionComponentInfoRequest,
	CompositionComponentInfoResponse
> = async ({input: {compositionFile, compositionId}, remotionRoot}) => {
	if (typeof compositionFile !== 'string') {
		throw new TypeError('Need to pass compositionFile');
	}

	if (typeof compositionId !== 'string') {
		throw new TypeError('Need to pass compositionId');
	}

	const location = await resolveCompositionComponent({
		remotionRoot,
		compositionFile,
		compositionId,
	});

	return {
		location: {
			source: location.source,
			line: location.line,
			column: location.column,
		},
		canAddSequence: location.canAddSequence,
	};
};
