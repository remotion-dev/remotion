import {BrowserSafeApis} from '@remotion/renderer/client';
import {
	Config as SharedConfig,
	ConfigInternals as SharedConfigInternals,
	type Concurrency,
	type WebpackConfiguration,
	type WebpackOverrideFn,
} from '@remotion/studio-server';
import {getRendererPortFromConfigFileAndCliFlag} from './preview-server';

export type {Concurrency, WebpackConfiguration, WebpackOverrideFn};

export const Config = SharedConfig;

export const ConfigInternals = {
	...SharedConfigInternals,
	getOutputCodecOrUndefined: BrowserSafeApis.getOutputCodecOrUndefined,
	getRendererPortFromConfigFileAndCliFlag,
};
