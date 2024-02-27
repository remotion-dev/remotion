import type {AnyRemotionOption} from './option';

const cliFlag = 'enable-lambda-insights' as const;

let option = false;

export const enableLambdaInsights = {
	name: 'Enable Lambda Insights',
	cliFlag,
	description: () => (
		<>
			Enable{' '}
			<a href="https://remotion.dev/docs/lambda/insights">
				Lambda Insights in AWS CloudWatch
			</a>
			. For this to work, you may have to update your role permission.
		</>
	),
	ssrName: 'enableLambdaInsights',
	docLink: 'https://www.remotion.dev/docs/lambda/insights',
	type: false as boolean,
	setConfig: (value: boolean) => {
		option = value;
	},
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				value: commandLine[cliFlag] as boolean,
				source: 'cli',
			};
		}

		if (option) {
			return {
				value: option,
				source: 'config',
			};
		}

		return {
			value: false,
			source: 'default',
		};
	},
} satisfies AnyRemotionOption<boolean>;
