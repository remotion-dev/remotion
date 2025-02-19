import type {AnyRemotionOption} from './option';

let offthreadVideoCacheSizeInBytes: number | null = null;

export const getOffthreadVideoCacheSizeInBytes = () => {
	return offthreadVideoCacheSizeInBytes;
};

const cliFlag = 'offthreadvideo-cache-size-in-bytes' as const;

export const offthreadVideoCacheSizeInBytesOption = {
	name: 'OffthreadVideo cache size',
	cliFlag,
	description: () => (
		<>
			From v4.0, Remotion has a cache for{' '}
			<a href="https://remotion.dev/docs/offthreadvideo">
				<code>&lt;OffthreadVideo&gt;</code>
			</a>{' '}
			frames. The default is <code>null</code>, corresponding to half of the
			system memory available when the render starts.
			<br /> This option allows to override the size of the cache. The higher it
			is, the faster the render will be, but the more memory will be used.
			<br />
			The used value will be printed when running in verbose mode.
			<br />
			Default: <code>null</code>
		</>
	),
	ssrName: 'offthreadVideoCacheSizeInBytes' as const,
	docLink: 'https://www.remotion.dev/docs/offthreadvideo',
	type: 0 as number | null,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				source: 'cli',
				value: commandLine[cliFlag] as number,
			};
		}

		if (offthreadVideoCacheSizeInBytes !== null) {
			return {
				source: 'config',
				value: offthreadVideoCacheSizeInBytes,
			};
		}

		return {
			source: 'default',
			value: null,
		};
	},
	setConfig: (size: number | null) => {
		offthreadVideoCacheSizeInBytes = size ?? null;
	},
} satisfies AnyRemotionOption<number | null>;

export const validateOffthreadVideoCacheSizeInBytes = (option: unknown) => {
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
