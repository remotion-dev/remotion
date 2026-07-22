import type {SpawnOptionsWithoutStdio} from 'node:child_process';

export const getPackageManagerSpawnOptions = (): Pick<
	SpawnOptionsWithoutStdio,
	'shell'
> => {
	return process.platform === 'win32' ? {shell: true} : {};
};
