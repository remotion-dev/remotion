import fs from 'fs';
import path from 'path';

export const addTailwindStyleCss = (projectRoot: string) => {
	const styleFile = path.join(projectRoot, 'src', 'style.css');
	fs.writeFileSync(
		styleFile,
		`@tailwind base;
@tailwind components;
@tailwind utilities;
`,
	);
};

export const addTailwindConfigJs = (projectRoot: string) => {
	const tailwindConfigFile = path.join(projectRoot, 'tailwind.config.js');

	fs.writeFileSync(
		tailwindConfigFile,
		`/* eslint-env node */
module.exports = {
  content: ["./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
`,
	);
};

export const addTailwindRootCss = (projectRoot: string) => {
	const rootFileTsx = path.join(projectRoot, 'src', 'Root.tsx');
	const rootFileJsx = path.join(projectRoot, 'src', 'Root.jsx');

	const rootFile = fs.existsSync(rootFileTsx) ? rootFileTsx : rootFileJsx;

	if (!fs.existsSync(rootFile)) {
		throw new Error('No Root file found');
	}

	const root = fs.readFileSync(rootFile, 'utf-8');

	const newFile = `import './style.css';\n${root}`;
	fs.writeFileSync(rootFile, newFile);
};

export const addTailwindToConfig = (projectRoot: string) => {
	const configFileTs = path.join(projectRoot, 'remotion.config.ts');
	const configFileJs = path.join(projectRoot, 'remotion.config.js');

	const configFile = fs.existsSync(configFileTs) ? configFileTs : configFileJs;

	if (!fs.existsSync(configFile)) {
		throw new Error('No remotion.config.ts file found');
	}

	const config = fs.readFileSync(configFile, 'utf-8');
	const lines = config.trim().split('\n');
	let lineNo = 0;
	let lastImportLine = 0;
	for (const line of lines) {
		if (line.startsWith('import ')) {
			lastImportLine = lineNo;
		}

		lineNo++;
	}

	const headerLines = lines.slice(0, lastImportLine + 1);
	const tailLines = lines.slice(lastImportLine + 1);

	const newLines = [
		...headerLines,
		`import { enableTailwind } from '@remotion/tailwind';`,
		...tailLines,
		'Config.overrideWebpackConfig(enableTailwind);',
	];

	fs.writeFileSync(configFile, newLines.join('\n') + '\n');
};
