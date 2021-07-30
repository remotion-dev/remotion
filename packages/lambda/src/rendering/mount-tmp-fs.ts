import execa from 'execa';

export const mountTmpFs = async () => {
	await execa('mount', [
		'-t',
		'tmpfs',
		'-o',
		'size=512m',
		'tmpfs',
		'/mnt/ramdisk',
	]);
};
