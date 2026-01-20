import type {AnyRemotionOption} from './option';

const cliFlag = 'is-production' as const;

let currentIsProductionKey: boolean | null = null;

export const isProductionOption = {
	name: 'Is Production',
	cliFlag,
	description: () => (
		<>
			Pass "true" if you are rendering in production and the default value is
			"true". All the production renders are considered as billable renders on
			the Pro platform.
		</>
	),
	ssrName: 'isProduction' as const,
	docLink: 'https://www.remotion.dev/docs/licensing',
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				source: 'cli',
				value: commandLine[cliFlag] as string | null,
			};
		}

		if (currentIsProductionKey !== null) {
			return {
				source: 'config',
				value: currentIsProductionKey.toString(),
			};
		}

		return {
			source: 'default',
			value: null,
		};
	},
	setConfig: (value: string | null) => {
		currentIsProductionKey = value === 'true';
	},
	type: null as string | null,
} satisfies AnyRemotionOption<string | null>;
