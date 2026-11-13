import type {DelayRenderScope} from 'remotion';

// React may decorate Error.stack after an effect throws. Observe the actual
// first cancelled hold release, before React receives and decorates the error.
export const observeCancelledRelease = (
	scope: DelayRenderScope,
	onRelease: (error: Error, rawStack: string) => void,
) => {
	const descriptor = Object.getOwnPropertyDescriptor(
		scope,
		'remotion_delayRenderHandles',
	);
	if (
		!descriptor ||
		!('value' in descriptor) ||
		!descriptor.writable ||
		!descriptor.configurable
	)
		throw new Error('Expected writable, configurable render hold state');

	let handles = scope.remotion_delayRenderHandles;
	let observed = false;
	Object.defineProperty(scope, 'remotion_delayRenderHandles', {
		configurable: true,
		enumerable: descriptor.enumerable,
		get: () => handles,
		set: (value: DelayRenderScope['remotion_delayRenderHandles']) => {
			const previousLength = handles.length;
			handles = value;
			const error = scope.remotion_cancelledErrorObject;
			if (!observed && value.length < previousLength && error) {
				observed = true;
				onRelease(error, error.stack ?? '');
			}
		},
	});

	return () => {
		Object.defineProperty(scope, 'remotion_delayRenderHandles', {
			...descriptor,
			value: handles,
		});
	};
};
