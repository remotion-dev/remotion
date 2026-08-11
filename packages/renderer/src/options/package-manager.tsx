import type {AnyRemotionOption} from './option';

const cliFlag = 'package-manager' as const;

let currentPackageManager: string | null = null;

export const packageManagerOption = {
	name: 'Package Manager',
	cliFlag,
	description: () => {
		return (
			<>
				Forces a specific package manager to be used. By default, Remotion will
				auto-detect the package manager based on your lockfile.
				<br />
				Acceptable values are <code>npm</code>, <code>yarn</code>,{' '}
				<code>pnpm</code> and <code>bun</code>.
			</>
		);
	},
	ssrName: 'packageManager' as const,
	docLink: 'https://www.remotion.dev/docs/cli/upgrade#--package-manager',
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				source: 'cli',
				value: commandLine[cliFlag] as string,
			};
		}

		if (currentPackageManager !== null) {
			return {
				source: 'config',
				value: currentPackageManager,
			};
		}

		return {
			source: 'default',
			value: null,
		};
	},
	setConfig: (value: string | null) => {
		currentPackageManager = value;
	},
	type: '' as string | null,
	id: cliFlag,
} satisfies AnyRemotionOption<string | null>;
