import type {LoaderDefinition} from 'webpack';

const rspackReactRefreshDelay = '      }, 30);';
const zeroDelayReactRefresh = '      }, 0);';

const removeRspackReactRefreshDelay = (source: string) => {
	const occurrences = source.split(rspackReactRefreshDelay).length - 1;

	if (occurrences !== 1) {
		throw new Error(
			`Expected one 30ms React Refresh debounce in @rspack/plugin-react-refresh, found ${occurrences}.`,
		);
	}

	return source.replace(rspackReactRefreshDelay, zeroDelayReactRefresh);
};

const ZeroDelayRspackRefreshLoader: LoaderDefinition = function (source) {
	return removeRspackReactRefreshDelay(source);
};

export default ZeroDelayRspackRefreshLoader;
