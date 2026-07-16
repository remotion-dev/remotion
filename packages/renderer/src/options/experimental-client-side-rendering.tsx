import type {AnyRemotionOption} from './option';

const cliFlag = 'enable-experimental-client-side-rendering' as const;

/**
 * @deprecated Client-side rendering is always enabled.
 */
export const experimentalClientSideRenderingOption = {
	name: 'Enable Client-Side Rendering (deprecated)',
	cliFlag,
	description: () => (
		<>
			Deprecated in Remotion 4.0.491. Client-side rendering is always enabled
			and this option has no effect.
		</>
	),
	ssrName: null,
	docLink: 'https://www.remotion.dev/docs/client-side-rendering',
	type: true as boolean,
	getValue: (_options: {commandLine: Record<string, unknown>}) => {
		return {
			value: true,
			source: 'default',
		};
	},
	setConfig(_value: boolean) {},
	id: cliFlag,
} satisfies AnyRemotionOption<boolean>;
