import fs from 'fs';
import path from 'path';

export const addPostcssConfig = (projectRoot: string) => {
	const postcssConfigMjs = path.join(projectRoot, 'postcss.config.mjs');

	fs.writeFileSync(
		postcssConfigMjs,
		`
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
`.trim() + '\n',
	);
};

export const addTailwindRootCss = (projectRoot: string) => {
	const rootFileTsx = path.join(projectRoot, 'src', 'Root.tsx');
	const rootFileJsx = path.join(projectRoot, 'src', 'Root.jsx');
	const indexCss = path.join(projectRoot, 'src', 'index.css');

	const rootFile = fs.existsSync(rootFileTsx) ? rootFileTsx : rootFileJsx;

	if (!fs.existsSync(rootFile)) {
		throw new Error('No Root file found');
	}

	const root = fs.readFileSync(rootFile, 'utf-8');

	const newFile = `import "./index.css";\n${root}`;
	fs.writeFileSync(rootFile, newFile);

	const css = `@import "tailwindcss";\n`;
	fs.writeFileSync(indexCss, css);
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
		`import { enableTailwind } from '@remotion/tailwind-v4';`,
		...tailLines,
		'Config.overrideWebpackConfig(enableTailwind);',
	];

	fs.writeFileSync(configFile, newLines.join('\n') + '\n');
};
