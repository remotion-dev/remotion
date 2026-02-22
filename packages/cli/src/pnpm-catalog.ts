import fs from 'node:fs';
import path from 'node:path';

type CatalogPackages = {
	// packageName -> catalog name ('' for default catalog)
	[packageName: string]: string;
};

const MAX_PARENT_DIR_LOOKUPS = 5;

// Regex for matching named catalog keys in pnpm-workspace.yaml
const CATALOG_NAME_REGEX =
	/^['"]?([^'":\s]+(?:[\s\w-]*[^'":\s])?)['"]?\s*:$/;

/**
 * Searches for pnpm-workspace.yaml starting from the given directory and going up.
 */
export const findPnpmWorkspaceYaml = (startDir: string): string | null => {
	let dir = startDir;
	for (let i = 0; i < MAX_PARENT_DIR_LOOKUPS; i++) {
		const yamlPath = path.join(dir, 'pnpm-workspace.yaml');
		if (fs.existsSync(yamlPath)) {
			return yamlPath;
		}

		const parentDir = path.dirname(dir);
		if (parentDir === dir) {
			break;
		}

		dir = parentDir;
	}

	return null;
};

/**
 * Reads pnpm-workspace.yaml and returns all packages defined in any catalog section.
 * Returns a map of packageName -> catalogName ('' for the default catalog).
 */
export const getCatalogPackagesFromWorkspaceYaml = (
	yamlPath: string,
): CatalogPackages => {
	const content = fs.readFileSync(yamlPath, 'utf-8');
	return parseCatalogPackagesFromYaml(content);
};

export const parseCatalogPackagesFromYaml = (
	content: string,
): CatalogPackages => {
	const result: CatalogPackages = {};
	const lines = content.split('\n');

	type State =
		| {type: 'root'}
		| {type: 'default-catalog'}
		| {type: 'catalogs-section'}
		| {type: 'named-catalog'; name: string};

	let state: State = {type: 'root'};

	for (const line of lines) {
		const trimmed = line.trimStart();
		if (trimmed === '' || trimmed.startsWith('#')) {
			continue;
		}

		const indent = line.length - trimmed.length;

		// Top-level keys (indent 0)
		if (indent === 0) {
			if (trimmed === 'catalog:') {
				state = {type: 'default-catalog'};
			} else if (trimmed === 'catalogs:') {
				state = {type: 'catalogs-section'};
			} else {
				state = {type: 'root'};
			}

			continue;
		}

		// When in named-catalog and see indent <= 2, could be a sibling catalog key
		if (state.type === 'named-catalog' && indent <= 2) {
			state = {type: 'catalogs-section'};
			// Fall through to process as catalogs-section
		}

		// Inside catalogs: section, named catalog keys are at indent 2
		if (state.type === 'catalogs-section' && indent === 2) {
			const match = trimmed.match(CATALOG_NAME_REGEX);
			if (match && match[1]) {
				state = {type: 'named-catalog', name: match[1]};
			}

			continue;
		}

		// Inside default catalog: packages at indent 2
		if (state.type === 'default-catalog' && indent === 2) {
			const pkgName = extractPackageName(trimmed);
			if (pkgName) {
				result[pkgName] = '';
			}

			continue;
		}

		// Inside a named catalog: packages at indent 4
		if (state.type === 'named-catalog' && indent === 4) {
			const pkgName = extractPackageName(trimmed);
			if (pkgName) {
				result[pkgName] = state.name;
			}

			continue;
		}
	}

	return result;
};

/**
 * Extracts a package name from a YAML key-value line like:
 *   `remotion: ^4.0.0`
 *   `'@remotion/cli': ^4.0.0`
 *   `"@remotion/player": ^4.0.0`
 */
const extractPackageName = (trimmedLine: string): string | null => {
	// Match: 'pkg': version, "pkg": version, or pkg: version
	const match = trimmedLine.match(/^['"]?(@?[^'":\s][^'":]*?)['"]?\s*:/);
	if (match) {
		return match[1] ?? null;
	}

	return null;
};

/**
 * Updates the version of a specific package in a specific catalog within a pnpm-workspace.yaml content string.
 * Returns the updated content.
 */
export const updateCatalogVersionInYaml = (
	yamlContent: string,
	packageName: string,
	newVersion: string,
	catalogName: string, // '' for default catalog, 'name' for named catalog
): string => {
	const lines = yamlContent.split('\n');

	type State =
		| {type: 'root'}
		| {type: 'default-catalog'}
		| {type: 'catalogs-section'}
		| {type: 'named-catalog'; name: string};

	let state: State = {type: 'root'};

	const result = lines.map((line) => {
		const trimmed = line.trimStart();
		if (trimmed === '' || trimmed.startsWith('#')) {
			return line;
		}

		const indent = line.length - trimmed.length;

		// Top-level keys (indent 0)
		if (indent === 0) {
			if (trimmed === 'catalog:') {
				state = {type: 'default-catalog'};
			} else if (trimmed === 'catalogs:') {
				state = {type: 'catalogs-section'};
			} else {
				state = {type: 'root'};
			}

			return line;
		}

		// When in named-catalog and see indent <= 2, could be a sibling catalog key
		if (state.type === 'named-catalog' && indent <= 2) {
			state = {type: 'catalogs-section'};
			// Fall through to process as catalogs-section
		}

		// Inside catalogs: section, named catalog keys are at indent 2
		if (state.type === 'catalogs-section' && indent === 2) {
			const match = trimmed.match(CATALOG_NAME_REGEX);
			if (match && match[1]) {
				state = {type: 'named-catalog', name: match[1]};
			}

			return line;
		}

		// Inside default catalog: packages at indent 2
		if (
			state.type === 'default-catalog' &&
			indent === 2 &&
			catalogName === ''
		) {
			return replaceVersionInLine(line, packageName, newVersion);
		}

		// Inside a named catalog: packages at indent 4
		if (
			state.type === 'named-catalog' &&
			indent === 4 &&
			state.name === catalogName
		) {
			return replaceVersionInLine(line, packageName, newVersion);
		}

		return line;
	});

	return result.join('\n');
};

const replaceVersionInLine = (
	originalLine: string,
	packageName: string,
	newVersion: string,
): string => {
	const escapedPkg = packageName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const regex = new RegExp(
		`^(\\s*(?:'${escapedPkg}'|"${escapedPkg}"|${escapedPkg}))(\\s*:)\\s*.*$`,
	);
	if (regex.test(originalLine)) {
		return originalLine.replace(regex, `$1$2 ${newVersion}`);
	}

	return originalLine;
};

/**
 * Given a package.json object and a list of packages, determines which packages
 * use catalog: entries and returns a map of packageName -> catalogName.
 */
export const getPackagesCatalogRefs = (
	packageJson: Record<string, Record<string, string>>,
	packageNames: string[],
): CatalogPackages => {
	const allDeps: Record<string, string> = {
		...(packageJson.dependencies ?? {}),
		...(packageJson.devDependencies ?? {}),
		...(packageJson.optionalDependencies ?? {}),
		...(packageJson.peerDependencies ?? {}),
	};

	const result: CatalogPackages = {};
	for (const pkg of packageNames) {
		const version = allDeps[pkg];
		if (typeof version === 'string' && version.startsWith('catalog:')) {
			// 'catalog:' -> default catalog (name = '')
			// 'catalog:name' -> named catalog
			const catalogName = version.slice('catalog:'.length);
			result[pkg] = catalogName;
		}
	}

	return result;
};
