import {useContext, useMemo} from 'react';
import {ThumbnailEmitterContext} from './emitter-context.js';
import type {ThumbnailEmitter} from './event-emitter.js';

type UseThumbnailMethods = {
	emitter: ThumbnailEmitter;
};

export const useThumbnail = (): UseThumbnailMethods => {
	const emitter = useContext(ThumbnailEmitterContext);

	if (!emitter) {
		throw new TypeError('Expected Player event emitter context');
	}

	const returnValue: UseThumbnailMethods = useMemo(() => {
		return {
			emitter,
		};
	}, [emitter]);

	return returnValue;
};
