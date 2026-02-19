import type {AnyRemotionOption} from './option';

export type ProResProfile =
	| '4444-xq'
	| '4444'
	| 'hq'
	| 'standard'
	| 'light'
	| 'proxy';

const validProResProfiles: ProResProfile[] = [
	'4444-xq',
	'4444',
	'hq',
	'standard',
	'light',
	'proxy',
];

let proResProfile: ProResProfile | undefined;

const cliFlag = 'prores-profile' as const;

export const proResProfileOption = {
	name: 'ProRes profile',
	cliFlag,
	description: () => (
		<>
			Set the ProRes profile. This option is only valid if the codec has been
			set to <code>prores</code>. Possible values:{' '}
			{validProResProfiles.map((p) => `"${p}"`).join(', ')}. Default:{' '}
			<code>&quot;hq&quot;</code>. See{' '}
			<a href="https://video.stackexchange.com/a/14715">here</a> for an
			explanation of possible values.
		</>
	),
	ssrName: 'proResProfile' as const,
	docLink: 'https://www.remotion.dev/docs/config#setproresprofile',
	type: undefined as ProResProfile | undefined,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				source: 'cli',
				value: String(commandLine[cliFlag]) as ProResProfile,
			};
		}

		if (proResProfile !== undefined) {
			return {
				source: 'config',
				value: proResProfile,
			};
		}

		return {
			source: 'default',
			value: undefined,
		};
	},
	setConfig: (value) => {
		proResProfile = value;
	},
	id: cliFlag,
} satisfies AnyRemotionOption<ProResProfile | undefined>;
