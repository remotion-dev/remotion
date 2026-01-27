import type {AnyRemotionOption} from './option';

const cliFlag = 'is-production' as const;

let currentIsProductionKey: boolean | null = null;

export const isProductionOption = {
	name: 'Is Production',
	cliFlag,
	description: () => (
		<>
			Pass <code>false</code> if this a development render to not count it as a
			billable render on remotion.pro. Only can be used in conjuction with{' '}
			<code>licenseKey</code>.
		</>
	),
	ssrName: 'isProduction' as const,
	docLink: 'https://www.remotion.dev/docs/licensing',
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				source: 'cli',
				value: commandLine[cliFlag] as boolean | null,
			};
		}

		if (currentIsProductionKey !== null) {
			return {
				source: 'config',
				value: currentIsProductionKey,
			};
		}

		return {
			source: 'default',
			value: null,
		};
	},
	setConfig: (value: boolean | null) => {
		currentIsProductionKey = value;
	},
	type: false as boolean | null,
} satisfies AnyRemotionOption<boolean | null>;
