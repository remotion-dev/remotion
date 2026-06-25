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
	getValue: (
		{commandLine},
		options?: {
			uiProResProfile: ProResProfile | undefined;
			compositionDefaultProResProfile: ProResProfile | null;
		},
	) => {
		if (options?.uiProResProfile) {
			return {
				source: 'via UI',
				value: options.uiProResProfile,
			};
		}

		if (commandLine[cliFlag] !== undefined) {
			return {
				source: 'from --prores-profile flag',
				value: String(commandLine[cliFlag]) as ProResProfile,
			};
		}

		if (options && options.compositionDefaultProResProfile !== null) {
			return {
				source: 'via calculateMetadata',
				value: options.compositionDefaultProResProfile,
			};
		}

		if (proResProfile !== undefined) {
			return {
				source: 'Config file',
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
