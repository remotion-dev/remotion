import type {AnyRemotionOption} from './option';

let mediaCacheSizeInBytes: number | null = null;

export const getMediaCacheSizeInBytes = () => {
	return mediaCacheSizeInBytes;
};

const cliFlag = 'media-cache-size-in-bytes' as const;

export const mediaCacheSizeInBytesOption = {
	name: '@remotion/media cache size',
	cliFlag,
	description: () => (
		<>
			Specify the maximum size of the cache that <code>&lt;Video&gt;</code> and{' '}
			<code>&lt;Audio&gt;</code> from <code>@remotion/media</code> may use
			combined, in bytes. <br />
			The default is half of the available system memory when the render starts.
		</>
	),
	ssrName: 'mediaCacheSizeInBytes' as const,
	docLink: 'https://www.remotion.dev/docs/media/video#setting-the-cache-size',
	type: 0 as number | null,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				source: 'cli',
				value: commandLine[cliFlag] as number,
			};
		}

		if (mediaCacheSizeInBytes !== null) {
			return {
				source: 'config',
				value: mediaCacheSizeInBytes,
			};
		}

		return {
			source: 'default',
			value: null,
		};
	},
	setConfig: (size: number | null) => {
		mediaCacheSizeInBytes = size ?? null;
	},
} satisfies AnyRemotionOption<number | null>;

export const validateMediaCacheSizeInBytes = (option: unknown) => {
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
