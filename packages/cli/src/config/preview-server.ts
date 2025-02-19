import {parsedCli} from '../parsed-cli';

let studioPort: number | undefined;
let rendererPort: number | undefined;

const validatePort = (port: number | undefined) => {
	if (!['number', 'undefined'].includes(typeof port)) {
		throw new Error(
			`Studio server port should be a number. Got ${typeof port} (${JSON.stringify(
				port,
			)})`,
		);
	}

	if (port === undefined) {
		return;
	}

	if (port < 1 || port > 65535) {
		throw new Error(
			`Studio server port should be a number between 1 and 65535. Got ${port}`,
		);
	}
};

/**
 *
 * @param port
 * @deprecated Use the `setStudioPort` and `setRendererPort` functions instead
 * @returns
 */
export const setPort = (port: number | undefined) => {
	setStudioPort(port);
	setRendererPort(port);
};

export const setStudioPort = (port: number | undefined) => {
	validatePort(port);

	studioPort = port;
};

export const setRendererPort = (port: number | undefined) => {
	validatePort(port);

	rendererPort = port;
};

export const getStudioPort = () => studioPort;

export const getRendererPortFromConfigFile = () => {
	return rendererPort ?? null;
};

export const getRendererPortFromConfigFileAndCliFlag = (): number | null => {
	return parsedCli.port ?? rendererPort ?? null;
};
