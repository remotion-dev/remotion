import type {CanUpdateSequencePropsResponse} from '@remotion/studio-shared';
import {Internals} from 'remotion';
import type {SequenceSchema, SequenceNodePath} from 'remotion';
import {callApi} from '../call-api';

const fireUnsubscribe = (
	fileName: string,
	nodePath: SequenceNodePath,
	clientId: string,
) => {
	callApi('/api/unsubscribe-from-sequence-props', {
		fileName,
		nodePath,
		clientId,
	}).catch(() => {
		// Ignore unsubscribe errors
	});
};

export const acquireSequencePropsSubscription = ({
	clientId,
	fileName,
	line,
	column,
	schema,
	onChange,
}: {
	clientId: string;
	fileName: string;
	line: number;
	column: number;
	schema: SequenceSchema;
	onChange: (snapshot: CanUpdateSequencePropsResponse) => void;
}): (() => void) => {
	let resolvedNodePath: SequenceNodePath | null = null;
	callApi('/api/subscribe-to-sequence-props', {
		fileName,
		line,
		column,
		schema,
		clientId,
	})
		.then((result) => {
			if (result.canUpdate) {
				resolvedNodePath = result.nodePath;
			}

			onChange(result);
		})
		.catch((err) => {
			Internals.Log.error(err);
		});

	return () => {
		if (resolvedNodePath) {
			fireUnsubscribe(fileName, resolvedNodePath, clientId);
		}
	};
};
