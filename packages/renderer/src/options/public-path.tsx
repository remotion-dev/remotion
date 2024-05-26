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
				it is <code>/</code>, meaning that the bundle is going to be hosted at
				the root of the domain (e.g. <code>https://localhost:3000/</code>). If
				you are deploying to a subdirectory (e.g. <code>/sites/my-site/</code>),
				you should set this to the subdirectory.
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
} satisfies AnyRemotionOption<string | null>;
