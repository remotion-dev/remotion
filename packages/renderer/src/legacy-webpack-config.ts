export type ServeUrl =
	| string
	| {
			browserUrl: string;
			nodeUrl: string;
	  };

export type ServeUrlOrWebpackBundle =
	| {
			serveUrl: ServeUrl;
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

export const getBrowserServeUrl = (serve: ServeUrl): string | null => {
	if (typeof serve === 'string') {
		return serve;
	}

	return serve.browserUrl ?? null;
};
