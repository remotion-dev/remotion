import type {CompletedClientRender} from '@remotion/studio-shared';
import {addCompletedClientRender} from '../../client-render-queue';
import type {ApiHandler} from '../api-types';
import {validateSameOrigin} from '../validate-same-origin';

export const registerClientRenderHandler: ApiHandler<
	CompletedClientRender,
	void
> = ({input, remotionRoot, request}) => {
	validateSameOrigin(request);
	addCompletedClientRender({render: input, remotionRoot});
	return Promise.resolve();
};
