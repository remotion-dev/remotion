import fs from 'fs';
import path from 'path';

export const patchPackageJson = (projectRoot: string, projectName: string) => {
	const fileName = path.join(projectRoot, 'package.json');

	const contents = fs.readFileSync(fileName, 'utf-8');
	const packageJson = JSON.parse(contents);
	const newPackageJson = JSON.stringify(
		{
			...packageJson,
			name: projectName,
		},
		undefined,
		2
	);

	fs.writeFileSync(fileName, newPackageJson);
};
