import fs from 'fs';
import path from 'path';
import typescript from 'typescript';
import {isDefaultConfigFile} from './get-config-file-name';
import {Log} from './log';

export const loadConfigFile = (configFileName: string): string | null => {
	const configFile = path.resolve(process.cwd(), configFileName);
	const tsconfigJson = path.join(process.cwd(), 'tsconfig.json');
	if (!fs.existsSync(tsconfigJson)) {
		Log.error(
			'Could not find a tsconfig.json file in your project. Did you delete it? Create a tsconfig.json in the root of your project. Copy the default file from https://github.com/JonnyBurger/remotion-template/blob/main/tsconfig.json.'
		);
		process.exit(1);
	}

	if (!fs.existsSync(configFile)) {
		if (!isDefaultConfigFile(configFileName)) {
			Log.error(
				`You specified a config file located at ${configFileName}, but no file at ${configFile} could be found.`
			);
			process.exit(1);
		}

		return null;
	}

	const tsConfig = typescript.readConfigFile(
		tsconfigJson,
		typescript.sys.readFile
	);

	const compilerOptions = typescript.parseJsonConfigFileContent(
		tsConfig.config,
		typescript.sys,
		'./'
	);

	const output = typescript.transpileModule(
		fs.readFileSync(configFile, 'utf-8'),
		{
			compilerOptions: compilerOptions.options,
		}
	);

	// eslint-disable-next-line no-eval
	eval(output.outputText);

	return configFileName;
};
