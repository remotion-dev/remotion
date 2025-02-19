import {getRemotionEnvironment} from '../get-remotion-environment.js';
import {deserializeJSONWithCustomFields} from '../input-props-serialization.js';

let didWarnSSRImport = false;

const warnOnceSSRImport = () => {
	if (didWarnSSRImport) {
		return;
	}

	didWarnSSRImport = true;
	// eslint-disable-next-line no-console
	console.warn(
		'Called `getInputProps()` on the server. This function is not available server-side and has returned an empty object.',
	);
	// eslint-disable-next-line no-console
	console.warn("To hide this warning, don't call this function on the server:");
	// eslint-disable-next-line no-console
	console.warn("  typeof window === 'undefined' ? {} : getInputProps()");
};

export const getInputProps = <
	T extends Record<string, unknown> = Record<string, unknown>,
>(): T => {
	if (typeof window === 'undefined') {
		warnOnceSSRImport();
		return {} as T;
	}

	if (getRemotionEnvironment().isPlayer) {
		throw new Error(
			'You cannot call `getInputProps()` from a <Player>. Instead, the props are available as React props from component that you passed as `component` prop.',
		);
	}

	const param = window.remotion_inputProps;
	if (!param) {
		return {} as T;
	}

	const parsed = deserializeJSONWithCustomFields<T>(param);
	return parsed;
};
