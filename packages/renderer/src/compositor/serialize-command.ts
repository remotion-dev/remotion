import {makeNonce} from './make-nonce';
import type {CompositorCommand, CompositorCommandSerialized} from './payloads';

export const serializeCommand = <Type extends keyof CompositorCommand>(
	command: Type,
	params: CompositorCommand[Type],
): CompositorCommandSerialized<Type> => {
	return {
		nonce: makeNonce(),
		payload: {
			type: command,
			params,
		},
	};
};
