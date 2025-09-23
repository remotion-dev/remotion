import type {AnyRemotionOption} from './option';

let videoCacheSizeInBytes: number | null = null;

export const getVideoCacheSizeInBytes = () => {
	return videoCacheSizeInBytes;
};

const cliFlag = 'video-cache-size-in-bytes' as const;

export const videoCacheSizeInBytesOption = {
	name: '<Video> cache size',
	cliFlag,
	description: () => (
		<>
			Specify the maximum size of the cache for <code>&lt;Video&gt;</code> (from{' '}
			<code>@remotion/media</code>) frames, in bytes. <br />
			Default: <code>1_000_000</code>
		</>
	),
	ssrName: 'videoCacheSizeInBytes' as const,
	docLink: 'https://www.remotion.dev/docs/media/video',
	type: 0 as number | null,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				source: 'cli',
				value: commandLine[cliFlag] as number,
			};
		}

		if (videoCacheSizeInBytes !== null) {
			return {
				source: 'config',
				value: videoCacheSizeInBytes,
			};
		}

		return {
			source: 'default',
			value: null,
		};
	},
	setConfig: (size: number | null) => {
		videoCacheSizeInBytes = size ?? null;
	},
} satisfies AnyRemotionOption<number | null>;

export const validateVideoCacheSizeInBytes = (option: unknown) => {
	if (option === undefined || option === null) {
		return;
	}

	if (typeof option !== 'number') {
		throw new Error('Expected a number');
	}

	if (option < 0 || option === 0) {
		throw new Error('Expected a positive number');
	}

	if (Number.isNaN(option)) {
		throw new Error('Expected a number');
	}

	if (!Number.isFinite(option)) {
		throw new Error('Expected a finite number');
	}

	if (option % 1 !== 0) {
		throw new Error('Expected a whole number');
	}
};
