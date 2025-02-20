import type {AnyRemotionOption} from './option';

let value: number | null = null;

export const getOffthreadVideoThreads = () => {
	return value;
};

const cliFlag = 'offthreadvideo-video-threads' as const;

export const offthreadVideoThreadsOption = {
	name: 'OffthreadVideo threads',
	cliFlag,
	description: () => (
		<>
			The number of threads that
			<a href="https://remotion.dev/docs/offthreadvideo">
				<code>&lt;OffthreadVideo&gt;</code>
			</a>{' '}
			can start to extract frames. frames. The default is{' '}
			{DEFAULT_RENDER_FRAMES_OFFTHREAD_VIDEO_THREADS}. Increase carefully, as
			too much threads may cause instability.
		</>
	),
	ssrName: 'offthreadVideoThreads' as const,
	docLink: 'https://www.remotion.dev/docs/offthreadvideo',
	type: 0 as number | null,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				source: 'cli',
				value: commandLine[cliFlag] as number,
			};
		}

		if (value !== null) {
			return {
				source: 'config',
				value,
			};
		}

		return {
			source: 'default',
			value: null,
		};
	},
	setConfig: (size: number | null) => {
		value = size ?? null;
	},
} satisfies AnyRemotionOption<number | null>;

export const DEFAULT_RENDER_FRAMES_OFFTHREAD_VIDEO_THREADS = 2;
