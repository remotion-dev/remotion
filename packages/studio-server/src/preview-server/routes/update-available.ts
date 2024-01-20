import type {
	UpdateAvailableRequest,
	UpdateAvailableResponse,
} from '@remotion/studio-shared';
import type {ApiHandler} from '../api-types';
import {isUpdateAvailableWithTimeout} from '../update-available';

export const handleUpdate: ApiHandler<
	UpdateAvailableRequest,
	UpdateAvailableResponse
> = async ({remotionRoot}) => {
	const data = await isUpdateAvailableWithTimeout(remotionRoot);

	return data;
};
