import execa from 'execa';
import path from 'path';

const files = ['gitignore', 'eslintrc', 'prettierrc', 'dockerignore'];

export const turnIntoUnderscore = async (dir: string) => {
	for (const file of files) {
		await execa(process.platform === 'win32' ? 'move' : 'mv', [
			path.join(dir, `.${file}`),
			path.join(dir, `_${file}`),
		]);
	}
};

export const turnIntoDot = async (dir: string) => {
	for (const file of files) {
		await execa(process.platform === 'win32' ? 'move' : 'mv', [
			path.join(dir, `_${file}`),
			path.join(dir, `.${file}`),
		]);
	}
};

export const deleteLockFile = async (dir: string, useYarn: boolean) => {
	const lockFileName = useYarn ? 'package-lock.json' : 'yarn.lock';
	await execa(process.platform === 'win32' ? 'del' : 'rm', [
		path.join(dir, lockFileName),
	]);
};

export const templateFolderName = '_template';
