import type {
	InsertElementRequest,
	InsertElementResponse,
	PrepareElementInstallRequest,
	PrepareElementInstallResponse,
} from '@remotion/studio-shared';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {callApi} from './call-api';

export const prepareElementInstall = (
	request: PrepareElementInstallRequest,
): Promise<PrepareElementInstallResponse> => {
	const browserStudioOperations = getBrowserStudioOperations();
	return browserStudioOperations
		? browserStudioOperations.prepareElementInstall(request)
		: callApi('/api/prepare-element-install', request);
};

export const installElement = (
	request: InsertElementRequest,
): Promise<InsertElementResponse> => {
	const browserStudioOperations = getBrowserStudioOperations();
	return browserStudioOperations
		? browserStudioOperations.insertElement(request)
		: callApi('/api/insert-element', request);
};
