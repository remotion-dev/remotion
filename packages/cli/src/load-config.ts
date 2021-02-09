import fs from 'fs';
import path from 'path';
import typescript from 'typescript';
import {isDefaultConfigFile} from './get-config-file-name';

export const loadConfigFile = (configFileName: string) => {
	const configFile = path.resolve(process.cwd(), configFileName);
	const tsconfigJson = path.join(process.cwd(), 'tsconfig.json');
	if (!fs.existsSync(tsconfigJson)) {
		console.log(
			'Could not find a tsconfig.json file in your project. Did you delete it? Create a tsconfig.json in the root of your project. Copy the default file from https://github.com/JonnyBurger/remotion-template/blob/main/tsconfig.json.'
		);
		process.exit(1);
	}
	if (!fs.existsSync(configFile)) {
		if (!isDefaultConfigFile(configFileName)) {
			console.log(
				`You specified a config file located at ${configFileName}, but no file at ${configFile} could be found.`
			);
			process.exit(1);
		}
		return;
	}

	const output = typescript.transpileModule(
		fs.readFileSync(configFile, 'utf-8'),
		JSON.parse(fs.readFileSync(tsconfigJson, 'utf-8'))
	);

	eval(output.outputText);
};
