let serverPort: number | undefined;

export const setPort = (port: number | undefined) => {
	if (!['number', 'undefined'].includes(typeof port)) {
		throw new Error(
			`Studio server port should be a number. Got ${typeof port} (${JSON.stringify(
				port
			)})`
		);
	}

	if (port === undefined) {
		serverPort = undefined;
		return;
	}

	if (port < 1 || port > 65535) {
		throw new Error(
			`Studio server port should be a number between 1 and 65535. Got ${port}`
		);
	}

	serverPort = port;
};

export const getServerPort = () => serverPort;
