export type ServeUrlOrWebpackBundle =
	| {
			serveUrl: string;
	  }
	| {
			/**
			 * @deprecated Renamed to `serveUrl`
			 */
			webpackBundle: string;
	  };

export const getServeUrlWithFallback = (serve: ServeUrlOrWebpackBundle) => {
	if ('webpackBundle' in serve) {
		return serve.webpackBundle;
	}

	if ('serveUrl' in serve) {
		return serve.serveUrl;
	}

	throw new Error('You must pass the `serveUrl` parameter');
};
