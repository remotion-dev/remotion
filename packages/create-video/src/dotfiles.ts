import path from 'path';
import execa from 'execa';

const files = ['gitignore', 'eslintrc', 'prettierrc'];

export const turnIntoUnderscore = async (dir: string) => {
	for (const file of files) {
		await execa('mv', [path.join(dir, `.${file}`), path.join(dir, `_${file}`)]);
	}
};

export const turnIntoDot = async (dir: string) => {
	for (const file of files) {
		await execa('mv', [path.join(dir, `_${file}`), path.join(dir, `.${file}`)]);
	}
};

export const templateDirName = '_template';
