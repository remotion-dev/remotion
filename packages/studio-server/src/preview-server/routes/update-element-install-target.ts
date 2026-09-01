import type {
	UpdateElementInstallTargetRequest,
	UpdateElementInstallTargetResponse,
} from '@remotion/studio-shared';
import type {ApiHandler} from '../api-types';
import {updateElementInstallTarget} from '../element-install-state';

const isFiniteTimestamp = (value: number | null) => {
	return value === null || (Number.isFinite(value) && value > 0);
};

export const updateElementInstallTargetHandler: ApiHandler<
	UpdateElementInstallTargetRequest,
	UpdateElementInstallTargetResponse
> = ({input, request}) => {
	if (typeof input.clientId !== 'string' || input.clientId.length === 0) {
		throw new Error('Invalid client ID');
	}

	if (input.requestId !== null && typeof input.requestId !== 'string') {
		throw new Error('Invalid request ID');
	}

	if (!isFiniteTimestamp(input.lastFocusedAt)) {
		throw new Error('Invalid focus timestamp');
	}

	if (
		input.compositionFile !== null &&
		typeof input.compositionFile !== 'string'
	) {
		throw new Error('Invalid composition file');
	}

	if (input.compositionId !== null && typeof input.compositionId !== 'string') {
		throw new Error('Invalid composition ID');
	}

	if (typeof input.studioUrl !== 'string') {
		throw new Error('Invalid Studio URL');
	}

	let studioUrl: URL;
	try {
		studioUrl = new URL(input.studioUrl);
	} catch {
		throw new Error('Invalid Studio URL');
	}

	if (
		typeof request.headers.origin !== 'string' ||
		studioUrl.origin !== request.headers.origin
	) {
		throw new Error('Studio URL must match the request origin');
	}

	updateElementInstallTarget(input);

	return Promise.resolve({});
};
