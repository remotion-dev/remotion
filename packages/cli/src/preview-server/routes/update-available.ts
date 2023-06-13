import type {ApiHandler} from '../api-types';
import type {
	UpdateAvailableRequest,
	UpdateAvailableResponse,
} from '../render-queue/job';
import {isUpdateAvailableWithTimeout} from '../update-available';

export const handleUpdate: ApiHandler<
	UpdateAvailableRequest,
	UpdateAvailableResponse
> = async ({remotionRoot}) => {
	const data = await isUpdateAvailableWithTimeout(remotionRoot);
	return data;
};
