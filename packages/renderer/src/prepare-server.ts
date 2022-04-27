import {isServeUrl} from './is-serve-url';
import {serveStatic} from './serve-static';

export const prepareServer = async (
	webpackConfigOrServeUrl: string
): Promise<{
	serveUrl: string;
	closeServer: () => Promise<void>;
}> => {
	if (isServeUrl(webpackConfigOrServeUrl)) {
		return Promise.resolve({
			serveUrl: webpackConfigOrServeUrl,
			closeServer: () => Promise.resolve(undefined),
		});
	}

	const {port, close} = await serveStatic(webpackConfigOrServeUrl);
	return Promise.resolve({
		closeServer: () => close(),
		serveUrl: `http://localhost:${port}`,
	});
};
