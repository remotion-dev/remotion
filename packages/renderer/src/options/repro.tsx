import type {AnyRemotionOption} from './option';

let enableRepro = false;

const setRepro = (should: boolean) => {
	enableRepro = should;
};

const cliFlag = 'repro' as const;

export const reproOption = {
	name: 'Create reproduction',
	cliFlag,
	description: () => (
		<>
			Create a ZIP that you can submit to Remotion if asked for a reproduction.
		</>
	),
	ssrName: 'repro',
	docLink: 'https://www.remotion.dev/docs/render-media#repro',
	type: false as boolean,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				value: commandLine[cliFlag] as boolean,
				source: 'cli',
			};
		}

		if (enableRepro) {
			return {
				value: enableRepro,
				source: 'config',
			};
		}

		return {
			value: false,
			source: 'default',
		};
	},
	setConfig: setRepro,
} satisfies AnyRemotionOption<boolean>;
