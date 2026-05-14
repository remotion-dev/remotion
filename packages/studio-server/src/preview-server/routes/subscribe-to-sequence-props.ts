import type {
	SubscribeToSequencePropsRequest,
	SubscribeToSequencePropsResponse,
} from '@remotion/studio-shared';
import {getAllSchemaKeys} from '../../codemods/get-all-schema-keys';
import type {ApiHandler} from '../api-types';
import {subscribeToSequencePropsWatchers} from '../sequence-props-watchers';

export const subscribeToSequenceProps: ApiHandler<
	SubscribeToSequencePropsRequest,
	SubscribeToSequencePropsResponse
> = ({input: {fileName, line, column, schema, clientId}, remotionRoot}) => {
	const result = subscribeToSequencePropsWatchers({
		fileName,
		line,
		column,
		keys: getAllSchemaKeys(schema),
		remotionRoot,
		clientId,
	});

	return Promise.resolve(result);
};
