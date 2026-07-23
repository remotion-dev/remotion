import type {AnyRemotionOption} from './option';

const cliFlag = 'public-path' as const;

let currentPublicPath: string | null = null;

export const publicPathOption = {
	name: 'Public Path',
	cliFlag,
	description: () => {
		return (
			<>
				The path of the URL where the bundle is going to be hosted. By default
				it is <code>./</code>, making the bundle relocatable. Set an absolute
				path such as <code>/sites/my-site/</code> to host the bundle at a fixed
				location.
			</>
		);
	},
	ssrName: 'publicPath' as const,
	docLink: 'https://www.remotion.dev/docs/renderer',
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				source: 'cli',
				value: commandLine[cliFlag] as string,
			};
		}

		if (currentPublicPath !== null) {
			return {
				source: 'config',
				value: currentPublicPath,
			};
		}

		return {
			source: 'default',
			value: null,
		};
	},
	setConfig: (value: string | null) => {
		currentPublicPath = value;
	},
	type: '' as string | null,
	id: cliFlag,
} satisfies AnyRemotionOption<string | null>;
