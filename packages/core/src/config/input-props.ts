import {getRemotionEnvironment} from '../get-environment';

export const INPUT_PROPS_KEY = 'remotion.inputProps';

let didWarnSSRImport = false;

const warnOnceSSRImport = () => {
	if (didWarnSSRImport) {
		return;
	}

	didWarnSSRImport = true;
	console.warn(
		'Called `getInputProps()` on the server. This function is not available server-side and has returned an empty object.'
	);
	console.warn("To hide this warning, don't call this function on the server:");
	console.warn("  typeof window === 'undefined' ? {} : getInputProps()");
};

export const getInputProps = () => {
	if (getRemotionEnvironment() === 'rendering') {
		if (typeof window === 'undefined') {
			warnOnceSSRImport();
			return {};
		}

		const param = localStorage.getItem(INPUT_PROPS_KEY);
		if (!param) {
			return {};
		}

		const parsed = JSON.parse(param);
		return parsed;
	}

	if (getRemotionEnvironment() === 'preview') {
		return process.env.INPUT_PROPS as unknown as object | null;
	}

	throw new Error(
		'You cannot call `getInputProps()` from a <Player>. Instead, the props are available as React props from component that you passed as `component` prop.'
	);
};
