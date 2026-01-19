import type {AnyRemotionOption} from './option';

let experimentalClientSideRenderingEnabled = false;

const cliFlag = 'enable-experimental-client-side-rendering' as const;

export const experimentalClientSideRenderingOption = {
	name: 'Enable Experimental Client-Side Rendering',
	cliFlag,
	description: () => (
		<>
			Enable WIP client-side rendering in the Remotion Studio. See
			https://www.remotion.dev/docs/client-side-rendering/ for notes.
		</>
	),
	ssrName: null,
	docLink: 'https://www.remotion.dev/docs/client-side-rendering',
	type: false as boolean,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			experimentalClientSideRenderingEnabled = true;
			return {
				value: experimentalClientSideRenderingEnabled,
				source: 'cli',
			};
		}

		return {
			value: experimentalClientSideRenderingEnabled,
			source: 'config',
		};
	},
	setConfig(value) {
		experimentalClientSideRenderingEnabled = value;
	},
} satisfies AnyRemotionOption<boolean>;
