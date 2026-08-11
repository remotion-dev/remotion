import type {AnyRemotionOption} from './option';

const cliFlag = 'props' as const;

export const propsOption = {
	name: 'Input Props',
	cliFlag,
	description: () => (
		<>
			Input Props to pass to the selected composition of your video. Must be a
			serialized JSON string (
			<code>
				--props=&apos;{'{'}&#34;hello&#34;: &#34;world&#34;{'}'}&#39;
			</code>
			) or a path to a JSON file (<code>./path/to/props.json</code>).
		</>
	),
	ssrName: null,
	docLink:
		'https://www.remotion.dev/docs/passing-props#passing-input-props-in-the-cli',
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				source: 'cli',
				value: commandLine[cliFlag] as string,
			};
		}

		return {
			source: 'default',
			value: null,
		};
	},
	setConfig: () => {
		throw new Error(
			'setProps is not supported. Pass --props via the CLI instead.',
		);
	},
	type: '' as string | null,
	id: cliFlag,
} satisfies AnyRemotionOption<string | null>;
