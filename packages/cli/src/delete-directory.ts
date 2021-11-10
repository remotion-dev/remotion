import execa from 'execa';

export const deleteDirectory = async (directory: string) => {
	// We use del before to remove all files inside the directories otherwise
	// rmdir will throw an error.
	await execa('cmd', ['/c', 'del', '/f', '/s', '/q', directory]);
	await execa('cmd', ['/c', 'rmdir', '/s', '/q', directory]);
};