import type {AnyRemotionOption} from './option';

const cliFlag = 'bind-address' as const;

let currentBindAddress: string | null = null;

export const bindAddressOption = {
	name: 'Bind address',
	addedIn: '4.0.537',
	cliFlag,
	description: () => (
		<>
			The address that the HTTP server which serves the bundle and the
			OffthreadVideo frames during a render listens on, for example{' '}
			<code>127.0.0.1</code> or <code>::1</code>. By default, the server listens
			on all network interfaces (<code>::</code>, or <code>0.0.0.0</code> if
			IPv6 is not available), which makes it reachable from other machines on
			the network for the duration of the render.
			<br />
			The browser always connects to the server via <code>localhost</code>, so
			the address you pass must resolve to the same host that runs the render.
		</>
	),
	ssrName: 'bindAddress' as const,
	docLink: 'https://www.remotion.dev/docs/options/bind-address',
	type: '' as string | null,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined && commandLine[cliFlag] !== null) {
			return {
				source: 'cli',
				value: commandLine[cliFlag] as string,
			};
		}

		if (currentBindAddress !== null) {
			return {
				source: 'config',
				value: currentBindAddress,
			};
		}

		return {
			source: 'default',
			value: null,
		};
	},
	setConfig: (value: string | null) => {
		currentBindAddress = value;
	},
	id: cliFlag,
} satisfies AnyRemotionOption<string | null>;
