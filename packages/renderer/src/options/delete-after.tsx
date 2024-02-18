import type {AnyRemotionOption} from './option';

export type DeleteAfter = '1-day' | '3-days' | '7-days' | '30-days';

const cliFlag = 'delete-after' as const;

let deleteAfter: DeleteAfter | null = null;

export const deleteAfterOption = {
	name: 'Lambda render expiration',
	cliFlag,
	description: () => {
		return (
			<>
				Automatically delete the render after a certain period. Accepted values
				are <code>1-day</code>, <code>3-days</code>, <code>7-days</code> and{' '}
				<code>30-days</code>.<br /> For this to work, your bucket needs to have{' '}
				<a href="/docs/lambda/autodelete">lifecycles enabled</a>.
			</>
		);
	},
	ssrName: 'deleteAfter' as const,
	docLink: 'https://www.remotion.dev/docs/lambda/autodelete',
	type: '1-day' as DeleteAfter | null,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				source: 'cli',
				value: commandLine[cliFlag] as DeleteAfter,
			};
		}

		if (deleteAfter !== null) {
			return {
				source: 'config',
				value: deleteAfter,
			};
		}

		return {
			source: 'default',
			value: null,
		};
	},
	setConfig: (value) => {
		deleteAfter = value;
	},
} satisfies AnyRemotionOption<DeleteAfter | null>;
