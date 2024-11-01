import type {AnyRemotionOption} from './option';

export type Metadata = Record<string, string>;

let metadata: Metadata = {};

const cliFlag = 'metadata' as const;

export const metadataOption = {
	name: 'Metadata',
	cliFlag,
	description: (mode) => {
		if (mode === 'ssr') {
			return (
				<>
					An object containing metadata to be embedded in the video. See{' '}
					<a href="/docs/metadata">here</a> for which metadata is accepted.
				</>
			);
		}

		return (
			<>
				Metadata to be embedded in the video. See{' '}
				<a href="/docs/metadata">here</a> for which metadata is accepted.
				<br />
				The parameter must be in the format of <code>
					--metadata key=value
				</code>{' '}
				and can be passed multiple times.
			</>
		);
	},
	docLink: 'https://www.remotion.dev/docs/metadata',
	type: {} as Metadata,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			const val = commandLine[cliFlag] as string | string[];
			const array = typeof val === 'string' ? [val] : val;
			const keyValues = array.map((a) => {
				if (!a.includes('=')) {
					throw new Error(
						`"metadata" must be in the format of key=value, but got ${a}`,
					);
				}

				const splitted = a.split('=');
				if (splitted.length !== 2) {
					throw new Error(
						`"metadata" must be in the format of key=value, but got ${a}`,
					);
				}

				return [splitted[0], splitted[1]] as [string, string];
			});
			const value = Object.fromEntries(keyValues);

			return {
				source: 'config',
				value,
			};
		}

		return {
			source: 'config',
			value: metadata,
		};
	},
	setConfig: (newMetadata: Metadata) => {
		metadata = newMetadata;
	},
	ssrName: 'metadata',
} satisfies AnyRemotionOption<Metadata>;
