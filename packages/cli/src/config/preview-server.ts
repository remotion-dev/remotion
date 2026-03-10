import {BrowserSafeApis} from '@remotion/renderer/client';
import {
	Config as SharedConfig,
	ConfigInternals as SharedConfigInternals,
} from '@remotion/studio-server';
import {parsedCli} from '../parsed-cli';

const {portOption} = BrowserSafeApis.options;
const {setPort: setSharedPort, setStudioPort, setRendererPort} = SharedConfig;
const {getStudioPort, getRendererPortFromConfigFile} = SharedConfigInternals;

export {
	getRendererPortFromConfigFile,
	getStudioPort,
	setRendererPort,
	setStudioPort,
};

/**
 *
 * @param port
 * @deprecated Use the `setStudioPort` and `setRendererPort` functions instead
 * @returns
 */
export const setPort = (port: number | undefined) => {
	setSharedPort(port);
};

export const getRendererPortFromConfigFileAndCliFlag = (): number | null => {
	return (
		portOption.getValue({commandLine: parsedCli}).value ??
		SharedConfigInternals.getRendererPortFromConfigFile()
	);
};
