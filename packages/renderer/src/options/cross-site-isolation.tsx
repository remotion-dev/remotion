import type {AnyRemotionOption} from './option';

let enableCrossSiteIsolation = false;

const cliFlag = 'cross-site-isolation' as const;

export const enableCrossSiteIsolationOption = {
	name: 'Enable Cross-Site Isolation',
	cliFlag,
	description: () => (
		<>
			Enable Cross-Site Isolation in the Studio (sets Cross-Origin-Opener-Policy
			and Cross-Origin-Embedder-Policy HTTP headers, required for{' '}
			<code>@remotion/whisper-web</code>).
		</>
	),
	ssrName: null,
	docLink: 'https://www.remotion.dev/docs/config#setenablecrosssiteisolation',
	type: false as boolean,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				value: commandLine[cliFlag] as boolean,
				source: 'cli',
			};
		}

		return {
			value: enableCrossSiteIsolation,
			source: 'config',
		};
	},
	setConfig(value) {
		enableCrossSiteIsolation = value;
	},
} satisfies AnyRemotionOption<boolean>;
