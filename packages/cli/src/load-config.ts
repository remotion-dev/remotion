import fs from 'fs';
import path from 'path';
import typescript from 'typescript';

export const loadConfigFile = (configFileName: string) => {
	const configFile = path.join(process.cwd(), configFileName);
	const tsconfigJson = path.join(process.cwd(), 'tsconfig.json');
	if (!fs.existsSync(tsconfigJson)) {
		console.log(
			'Could not find a tsconfig.json file in your project. Did you delete it? Create a tsconfig.json in the root of your project. Copy the default file from https://github.com/JonnyBurger/remotion-template/blob/main/tsconfig.json.'
		);
		process.exit(1);
	}
	if (!fs.existsSync(configFile)) {
		return;
	}
	const output = typescript.transpileModule(
		fs.readFileSync(configFile, 'utf-8'),
		JSON.parse(fs.readFileSync(tsconfigJson, 'utf-8'))
	);
	const errors =
		output.diagnostics?.filter(
			(d) => d.category === typescript.DiagnosticCategory.Error
		) ?? [];
	if (errors.length > 0) {
		console.log(`Your ${configFileName} file has Typescript errors:`);
		for (const error of errors) {
			console.log(
				typescript.formatDiagnostic(error, {
					getCurrentDirectory: () => typescript.sys.getCurrentDirectory(),
					getCanonicalFileName: (f) => f,
					getNewLine: () => '\n',
				})
			);
			process.exit(1);
		}
	}
	eval(output.outputText);
};
