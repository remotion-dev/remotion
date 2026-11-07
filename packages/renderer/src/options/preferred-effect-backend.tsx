import type {PreferredEffectBackend} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import type {AnyRemotionOption} from './option';

const cliFlag = 'preferred-effect-backend' as const;
let configured: PreferredEffectBackend = 'auto';

export const preferredEffectBackendOption = {
	name: 'Preferred effect backend',
	addedIn: '4.0.540',
	cliFlag,
	id: cliFlag,
	ssrName: 'preferredEffectBackend',
	docLink: 'https://www.remotion.dev/docs/options/preferred-effect-backend',
	type: 'auto' as PreferredEffectBackend,
	description: () => (
		<>
			Prefer <code>webgpu</code>, <code>webgl2</code>, or <code>2d</code>{' '}
			implementations of{' '}
			<a href="https://www.remotion.dev/docs/effects">effects</a>. Default:{' '}
			<code>auto</code>, which tries WebGPU, WebGL2, then 2D. Falls back when an
			implementation or backend is unavailable. Lambda selects WebGL2 or 2D
			implementations. Rendering fails if an effect has no supported
			implementation. This option also applies to Studio preview.
		</>
	),
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined)
			return {
				value: NoReactInternals.validatePreferredEffectBackend(
					commandLine[cliFlag],
				),
				source: 'cli',
			};
		return {value: configured, source: 'config'};
	},
	setConfig: (value: PreferredEffectBackend) => {
		configured = NoReactInternals.validatePreferredEffectBackend(value);
	},
} satisfies AnyRemotionOption<PreferredEffectBackend>;
