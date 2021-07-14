import fs from 'fs';
import path from 'path';
import typescript from 'typescript';
import {Log} from './log';

export const loadConfigFile = (
	configFileName: string,
	isJavascript: boolean
): string | null => {
	const resolved = path.resolve(process.cwd(), configFileName);

	if (!isJavascript) {
		const tsconfigJson = path.join(process.cwd(), 'tsconfig.json');
		if (!fs.existsSync(tsconfigJson)) {
			Log.error(
				'Could not find a tsconfig.json file in your project. Did you delete it? Create a tsconfig.json in the root of your project. Copy the default file from https://github.com/remotion-dev/template/blob/main/tsconfig.json.'
			);
			process.exit(1);
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
			fs.readFileSync(resolved, 'utf-8'),
			{
				compilerOptions: compilerOptions.options,
			}
		);

		// eslint-disable-next-line no-eval
		eval(output.outputText);

		return resolved;
	}

	const outputs = typescript.transpileModule(
		fs.readFileSync(resolved, 'utf-8'),
		{}
	);

	// eslint-disable-next-line no-eval
	eval(outputs.outputText);

	return configFileName;
};
