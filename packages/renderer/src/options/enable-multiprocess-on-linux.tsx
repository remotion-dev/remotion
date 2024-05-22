import type {AnyRemotionOption} from './option';

const DEFAULT_VALUE = true;

let multiProcessOnLinux = DEFAULT_VALUE;

const cliFlag = 'enable-multiprocess-on-linux' as const;

export const enableMultiprocessOnLinuxOption = {
	name: 'Enable Multiprocess on Linux',
	cliFlag,
	description: () => (
		<>
			Removes the <code>{'--single-process'}</code> flag that gets passed to
			Chromium on Linux by default. This will make the render faster because
			multiple processes can be used, but may cause issues with some Linux
			distributions or if window server libraries are missing.
			<br />
			Default: <code>false</code> until v4.0.136, then <code>true</code> from
			v4.0.137 on because newer Chrome versions {"don't"} allow rendering with
			the <code>--single-process</code> flag. <br />
			This flag will be removed in Remotion v5.0.
		</>
	),
	ssrName: 'chromiumOptions.enableMultiprocessOnLinux',
	docLink: 'https://www.remotion.dev/docs/chromium-flags',
	type: false as boolean,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				source: 'cli',
				value: commandLine[cliFlag] as boolean,
			};
		}

		if (multiProcessOnLinux !== false) {
			return {
				source: 'config',
				value: multiProcessOnLinux,
			};
		}

		return {
			source: 'default',
			value: DEFAULT_VALUE,
		};
	},
	setConfig: (value: boolean) => {
		multiProcessOnLinux = value;
	},
} satisfies AnyRemotionOption<boolean>;
