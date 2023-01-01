import {getRemotionEnvironment} from '../get-environment';

let didWarnSSRImport = false;

const warnOnceSSRImport = () => {
	if (didWarnSSRImport) {
		return;
	}

	didWarnSSRImport = true;
};

export const getInputProps = () => {
	if (typeof window === 'undefined') {
		warnOnceSSRImport();
		return {};
	}

	if (
		getRemotionEnvironment() === 'player-development' ||
		getRemotionEnvironment() === 'player-production'
	) {
		throw new Error(
			'You cannot call `getInputProps()` from a <Player>. Instead, the props are available as React props from component that you passed as `component` prop.'
		);
	}

	const param = window.remotion_inputProps;
	if (!param) {
		return {};
	}

	const parsed = JSON.parse(param);
	return parsed;
};
