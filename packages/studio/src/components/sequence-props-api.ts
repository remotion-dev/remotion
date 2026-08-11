import type {
	SaveSequencePropsRequest,
	SaveSequencePropsResponse,
	SubscribeToSequencePropsRequest,
	SubscribeToSequencePropsResponse,
	UnsubscribeFromSequencePropsRequest,
} from '@remotion/studio-shared';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {callApi} from './call-api';

export const saveSequenceProps = (
	request: SaveSequencePropsRequest,
): Promise<SaveSequencePropsResponse> => {
	const browserStudioOperations = getBrowserStudioOperations();
	return browserStudioOperations
		? browserStudioOperations.saveSequenceProps(request)
		: callApi('/api/save-sequence-props', request);
};

export const subscribeToSequenceProps = (
	request: SubscribeToSequencePropsRequest,
): Promise<SubscribeToSequencePropsResponse> => {
	const browserStudioOperations = getBrowserStudioOperations();
	return browserStudioOperations
		? browserStudioOperations.subscribeToSequenceProps(request)
		: callApi('/api/subscribe-to-sequence-props', request);
};

export const unsubscribeFromSequenceProps = (
	request: UnsubscribeFromSequencePropsRequest,
): Promise<undefined> => {
	const browserStudioOperations = getBrowserStudioOperations();
	return browserStudioOperations
		? browserStudioOperations.unsubscribeFromSequenceProps(request)
		: callApi('/api/unsubscribe-from-sequence-props', request);
};
