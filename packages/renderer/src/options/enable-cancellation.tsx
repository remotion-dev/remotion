import type {AnyRemotionOption} from './option';

const cliFlag = 'enable-cancellation' as const;

let enableCancellation = false;

export const enableCancellationOption = {
	name: 'Enable cancellation',
	cliFlag,
	description: () => (
		<>
			Allows a Lambda render to be cancelled by pressing Ctrl+C while running{' '}
			<code>npx remotion lambda render</code>. Enabling cancellation causes each
			renderer function to poll S3 once per second while it is running.
		</>
	),
	ssrName: null,
	docLink:
		'https://www.remotion.dev/docs/lambda/cli/render#--enable-cancellation',
	type: false as boolean,
	setConfig: (value: boolean) => {
		enableCancellation = value;
	},
	getValue: ({commandLine}) => {
		if (typeof commandLine[cliFlag] === 'boolean') {
			return {
				value: commandLine[cliFlag],
				source: 'cli',
			};
		}

		return {
			value: enableCancellation,
			source: enableCancellation ? 'config' : 'default',
		};
	},
	id: cliFlag,
} satisfies AnyRemotionOption<boolean>;
