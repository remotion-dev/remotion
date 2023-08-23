import type {RemotionOption} from './option';

export const offthreadVideoCacheSizeOption: RemotionOption = {
	name: 'OffthreadVideo cache size',
	cliFlag: 'offthreadvideo-cache-size',
	description: (
		<>
			From v4.0, Remotion has a cache for{' '}
			<a href="https://remotion.dev/docs/offthreadvideo">
				<code>OffthreadVideo</code>
			</a>{' '}
			frames. The default is dependent on the available memory when the render
			starts. This option allows to override the number of video frames that
			should be kept in cache. The higher it is, the faster the render will be,
			but the more memory will be used.
		</>
	),
	ssrName: 'offthreadVideoCacheSize',
	docLink: 'https://www.remotion.dev/docs/offthreadvideo',
};

export const validateOffthreadVideoCacheSize = (option: unknown) => {
	if (option === undefined || option === null) {
		return;
	}

	if (typeof option !== 'number') {
		throw new Error('Expected a number');
	}

	if (option < 0) {
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
