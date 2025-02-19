import type {AnyRemotionOption} from './option';

const cliFlag = 'binaries-directory' as const;

let currentDirectory: string | null = null;

export const binariesDirectoryOption = {
	name: 'Binaries Directory',
	cliFlag,
	description: () => (
		<>
			The directory where the platform-specific binaries and libraries that
			Remotion needs are located. Those include an <code>ffmpeg</code> and{' '}
			<code>ffprobe</code> binary, a Rust binary for various tasks, and various
			shared libraries. If the value is set to <code>null</code>, which is the
			default, then the path of a platform-specific package located at{' '}
			<code>node_modules/@remotion/compositor-*</code> is selected.
			<br />
			This option is useful in environments where Remotion is not officially
			supported to run like bundled serverless functions or Electron.
		</>
	),
	ssrName: 'binariesDirectory' as const,
	docLink: 'https://www.remotion.dev/docs/renderer',
	type: '' as string | null,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				source: 'cli',
				value: commandLine[cliFlag] as string | null,
			};
		}

		if (currentDirectory !== null) {
			return {
				source: 'config',
				value: currentDirectory,
			};
		}

		return {
			source: 'default',
			value: null,
		};
	},
	setConfig: (value: string | null) => {
		currentDirectory = value;
	},
} satisfies AnyRemotionOption<string | null>;
