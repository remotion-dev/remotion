import fs from 'node:fs';
import path from 'node:path';

const CONFIG_IMPORT = `import {Config} from '@remotion/cli/config';`;
const SETTER_REGEX = /Config\.setPublicLicenseKey\(\s*(['"])([\s\S]*?)\1\s*\)/;
const CONFIG_IMPORT_REGEX =
	/import\s*\{[^}]*\bConfig\b[^}]*\}\s*from\s*['"]@remotion\/cli\/config['"]/;

export const validatePublicLicenseKey = (licenseKey: string | null) => {
	if (
		licenseKey !== null &&
		licenseKey !== 'free-license' &&
		!licenseKey.startsWith('rm_pub_')
	) {
		throw new Error(
			'Invalid public license key. It must start with "rm_pub_" or be "free-license".',
		);
	}
};

const formatSetter = (licenseKey: string) => {
	return `Config.setPublicLicenseKey('${licenseKey}');`;
};

const resolveConfigFile = (remotionRoot: string): string => {
	const configFileTs = path.join(remotionRoot, 'remotion.config.ts');
	const configFileJs = path.join(remotionRoot, 'remotion.config.js');

	if (fs.existsSync(configFileTs)) {
		return configFileTs;
	}

	if (fs.existsSync(configFileJs)) {
		return configFileJs;
	}

	return configFileTs;
};

const ensureConfigImport = (lines: string[]): string[] => {
	if (lines.some((line) => CONFIG_IMPORT_REGEX.test(line))) {
		return lines;
	}

	let lastImportLine = -1;
	for (let i = 0; i < lines.length; i++) {
		if (lines[i].startsWith('import ')) {
			lastImportLine = i;
		}
	}

	if (lastImportLine === -1) {
		if (lines.length === 0 || (lines.length === 1 && lines[0] === '')) {
			return [CONFIG_IMPORT];
		}

		return [CONFIG_IMPORT, '', ...lines];
	}

	const headerLines = lines.slice(0, lastImportLine + 1);
	const tailLines = lines.slice(lastImportLine + 1);
	return [...headerLines, CONFIG_IMPORT, ...tailLines];
};

export const setPublicLicenseKeyInConfig = ({
	remotionRoot,
	licenseKey,
}: {
	remotionRoot: string;
	licenseKey: string;
}): {configFile: string} => {
	validatePublicLicenseKey(licenseKey);

	const configFile = resolveConfigFile(remotionRoot);
	const setterLine = formatSetter(licenseKey);

	if (!fs.existsSync(configFile)) {
		fs.writeFileSync(configFile, `${CONFIG_IMPORT}\n\n${setterLine}\n`);
		return {configFile};
	}

	const config = fs.readFileSync(configFile, 'utf-8');
	const lines = config.replace(/\n$/, '').split('\n');

	let replaced = false;
	const updatedLines = lines.map((line) => {
		const nextLine = line.replace(
			SETTER_REGEX,
			`Config.setPublicLicenseKey('${licenseKey}')`,
		);
		if (nextLine !== line) {
			replaced = true;
		}

		return nextLine;
	});

	const nextLines = replaced
		? updatedLines
		: [...ensureConfigImport(updatedLines), setterLine];

	fs.writeFileSync(configFile, `${nextLines.join('\n')}\n`);

	return {configFile};
};
