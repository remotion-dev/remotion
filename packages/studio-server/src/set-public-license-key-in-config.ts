import fs from 'node:fs';
import path from 'node:path';

const CONFIG_IMPORT = `import {Config} from '@remotion/cli/config';`;
const LICENSE_KEY_PREFIX = 'rm_pub_';
const LICENSE_KEY_LENGTH = 55;
const SETTER_REGEX =
	/Config\.setPublicLicenseKey\(\s*(['"`])([\s\S]*?)\1\s*\)/g;
const COMPLEX_TEMPLATE_SETTER_REGEX =
	/Config\.setPublicLicenseKey\(\s*`[^`]*\$\{/;
const CONFIG_IMPORT_REGEX =
	/import\s*\{[^}]*\bConfig\b[^}]*\}\s*from\s*['"]@remotion\/cli\/config['"]/;

export const validatePublicLicenseKey = (licenseKey: string | null) => {
	if (licenseKey === null || licenseKey === 'free-license') {
		return;
	}

	if (!licenseKey.startsWith(LICENSE_KEY_PREFIX)) {
		throw new Error(
			'Invalid public license key. It must start with "rm_pub_" or be "free-license".',
		);
	}

	const afterPrefix = licenseKey.slice(LICENSE_KEY_PREFIX.length);
	if (!/^[a-zA-Z0-9]+$/.test(afterPrefix)) {
		throw new Error(
			'Invalid public license key. After "rm_pub_" it must contain only alphanumeric characters.',
		);
	}

	if (licenseKey.length !== LICENSE_KEY_LENGTH) {
		throw new Error(
			`Invalid public license key. It must be ${LICENSE_KEY_LENGTH} characters long.`,
		);
	}
};

const formatSetterCall = (licenseKey: string) => {
	return `Config.setPublicLicenseKey(${JSON.stringify(licenseKey)})`;
};

const formatSetter = (licenseKey: string) => {
	return `${formatSetterCall(licenseKey)};`;
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
	const setterCall = formatSetterCall(licenseKey);

	if (!fs.existsSync(configFile)) {
		fs.writeFileSync(configFile, `${CONFIG_IMPORT}\n\n${setterLine}\n`);
		return {configFile};
	}

	const config = fs.readFileSync(configFile, 'utf-8');

	if (COMPLEX_TEMPLATE_SETTER_REGEX.test(config)) {
		throw new Error(
			'Found Config.setPublicLicenseKey() using a template literal with ${}. Replace it with a string literal manually, then try again.',
		);
	}

	let replaced = false;
	const replacedConfig = config.replace(SETTER_REGEX, () => {
		replaced = true;
		return setterCall;
	});

	if (replaced) {
		fs.writeFileSync(configFile, replacedConfig.replace(/\n?$/, '\n'));
		return {configFile};
	}

	const lines = config.replace(/\n$/, '').split('\n');
	const nextLines = [...ensureConfigImport(lines), setterLine];
	fs.writeFileSync(configFile, `${nextLines.join('\n')}\n`);

	return {configFile};
};
