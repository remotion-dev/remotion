import type {AnyRemotionOption} from './option';

export const reproOption = {
	name: 'Create reproduction',
	cliFlag: 'repro',
	description: () => (
		<>
			Create a ZIP that you can submit to Remotion if asked for a reproduction.
		</>
	),
	ssrName: 'repro',
	docLink: 'https://www.remotion.dev/docs/render-media#repro',
	type: false as boolean,
} satisfies AnyRemotionOption<boolean>;
