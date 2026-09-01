import type {
	SubscribeToDefaultPropsRequest,
	SubscribeToDefaultPropsResponse,
	UnsubscribeFromDefaultPropsRequest,
} from '@remotion/studio-shared';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {callApi} from './call-api';

export const subscribeToDefaultProps = (
	request: SubscribeToDefaultPropsRequest,
): Promise<SubscribeToDefaultPropsResponse> => {
	const browserStudioOperations = getBrowserStudioOperations();
	return browserStudioOperations
		? browserStudioOperations.subscribeToDefaultProps(request)
		: callApi('/api/subscribe-to-default-props', request);
};

export const unsubscribeFromDefaultProps = (
	request: UnsubscribeFromDefaultPropsRequest,
): Promise<undefined> => {
	const browserStudioOperations = getBrowserStudioOperations();
	return browserStudioOperations
		? browserStudioOperations.unsubscribeFromDefaultProps(request)
		: callApi('/api/unsubscribe-from-default-props', request);
};
