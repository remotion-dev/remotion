import {removeCompletedClientRender} from '../../client-render-queue';
import type {ApiHandler} from '../api-types';
import {validateSameOrigin} from '../validate-same-origin';

export const unregisterClientRenderHandler: ApiHandler<{id: string}, void> = ({
	input: {id},
	request,
}) => {
	validateSameOrigin(request);
	removeCompletedClientRender(id);
	return Promise.resolve();
};
