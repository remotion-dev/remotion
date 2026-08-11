import fs from 'node:fs';
import path from 'node:path';

const WORKSPACE_ROOT_SEARCH_LIMIT = 5;

export const isCatalogProtocol = (version: string): boolean => {
	return version.startsWith('catalog:');
};

export const findVersionSpecifier = (
	depsWithVersions: {
		dependencies: Record<string, string>;
		devDependencies: Record<string, string>;
		optionalDependencies: Record<string, string>;
		peerDependencies: Record<string, string>;
	},
	pkg: string,
): string | null => {
	return (
		depsWithVersions.dependencies[pkg] ??
		depsWithVersions.devDependencies[pkg] ??
		depsWithVersions.optionalDependencies[pkg] ??
		depsWithVersions.peerDependencies[pkg] ??
		null
	);
};

export const findWorkspaceRoot = (startDir: string): string | null => {
	let currentDir = path.resolve(startDir);

	for (let i = 0; i < WORKSPACE_ROOT_SEARCH_LIMIT; i++) {
		const packageJsonPath = path.join(currentDir, 'package.json');

		if (fs.existsSync(packageJsonPath)) {
			try {
				const packageJson = JSON.parse(
					fs.readFileSync(packageJsonPath, 'utf-8'),
				);
				if (packageJson.workspaces) {
					return currentDir;
				}
			} catch {}
		}

		const pnpmWorkspacePath = path.join(currentDir, 'pnpm-workspace.yaml');
		if (fs.existsSync(pnpmWorkspacePath)) {
			return currentDir;
		}

		const parentDir = path.dirname(currentDir);
		if (parentDir === currentDir) {
			return null;
		}

		currentDir = parentDir;
	}

	return null;
};

type CatalogSource =
	| {type: 'package-json'; filePath: string; catalogKey: 'workspaces' | 'root'}
	| {type: 'pnpm-workspace'; filePath: string};

export const findCatalogSource = (
	workspaceRoot: string,
): CatalogSource | null => {
	const packageJsonPath = path.join(workspaceRoot, 'package.json');

	if (fs.existsSync(packageJsonPath)) {
		try {
			const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

			if (
				packageJson.workspaces &&
				typeof packageJson.workspaces === 'object' &&
				!Array.isArray(packageJson.workspaces) &&
				packageJson.workspaces.catalog
			) {
				return {
					type: 'package-json',
					filePath: packageJsonPath,
					catalogKey: 'workspaces',
				};
			}

			if (packageJson.catalog) {
				return {
					type: 'package-json',
					filePath: packageJsonPath,
					catalogKey: 'root',
				};
			}
		} catch {}
	}

	const pnpmWorkspacePath = path.join(workspaceRoot, 'pnpm-workspace.yaml');
	if (fs.existsSync(pnpmWorkspacePath)) {
		const content = fs.readFileSync(pnpmWorkspacePath, 'utf-8');
		if (/^catalog:/m.test(content)) {
			return {type: 'pnpm-workspace', filePath: pnpmWorkspacePath};
		}
	}

	return null;
};

export const getCatalogEntries = (
	workspaceRoot: string,
): Record<string, string> => {
	const source = findCatalogSource(workspaceRoot);
	if (!source) {
		return {};
	}

	if (source.type === 'package-json') {
		const packageJson = JSON.parse(fs.readFileSync(source.filePath, 'utf-8'));

		if (source.catalogKey === 'workspaces') {
			return (packageJson.workspaces.catalog ?? {}) as Record<string, string>;
		}

		return (packageJson.catalog ?? {}) as Record<string, string>;
	}

	return parsePnpmWorkspaceCatalog(fs.readFileSync(source.filePath, 'utf-8'));
};

export const parsePnpmWorkspaceCatalog = (
	content: string,
): Record<string, string> => {
	const lines = content.split('\n');
	const catalog: Record<string, string> = {};
	let inCatalogSection = false;

	for (const line of lines) {
		if (/^catalog:\s*$/.test(line)) {
			inCatalogSection = true;
			continue;
		}

		if (inCatalogSection && /^\S/.test(line) && line.trim() !== '') {
			inCatalogSection = false;
			continue;
		}

		if (inCatalogSection && line.trim() !== '') {
			const match = line.match(
				/^\s+(['"]?)([^'":\s]+)\1:\s*['"]?([^'"#\s]+)['"]?/,
			);
			if (match && match[2] && match[3]) {
				catalog[match[2]] = match[3];
			}
		}
	}

	return catalog;
};

export const updateCatalogEntryInPackageJson = ({
	filePath,
	catalogKey,
	pkg,
	newVersion,
}: {
	filePath: string;
	catalogKey: 'workspaces' | 'root';
	pkg: string;
	newVersion: string;
}): boolean => {
	const content = fs.readFileSync(filePath, 'utf-8');
	const packageJson = JSON.parse(content);

	const catalog =
		catalogKey === 'workspaces'
			? packageJson.workspaces?.catalog
			: packageJson.catalog;

	if (!catalog || !(pkg in catalog)) {
		return false;
	}

	catalog[pkg] = newVersion;

	const indentMatch = content.match(/^(\s+)"/m);
	const indent = indentMatch ? indentMatch[1] : '\t';

	fs.writeFileSync(filePath, JSON.stringify(packageJson, null, indent) + '\n');

	return true;
};

export const updateCatalogEntryInPnpmWorkspace = ({
	filePath,
	pkg,
	newVersion,
}: {
	filePath: string;
	pkg: string;
	newVersion: string;
}): boolean => {
	const content = fs.readFileSync(filePath, 'utf-8');
	const lines = content.split('\n');
	let inCatalogSection = false;
	let updated = false;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i] as string;

		if (/^catalog:\s*$/.test(line)) {
			inCatalogSection = true;
			continue;
		}

		if (inCatalogSection && /^\S/.test(line) && line.trim() !== '') {
			inCatalogSection = false;
			continue;
		}

		if (inCatalogSection) {
			const escapedPkg = pkg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
			const lineRegex = new RegExp(
				`^(\\s+(?:['"]?)${escapedPkg}(?:['"]?):\\s*)(['"]?)([^'"#\\s]+)\\2(.*)$`,
			);
			const match = line.match(lineRegex);
			if (match) {
				const prefix = match[1] ?? '';
				const quote = match[2] ?? '';
				const suffix = match[4] ?? '';
				lines[i] = `${prefix}${quote}${newVersion}${quote}${suffix}`;
				updated = true;
				break;
			}
		}
	}

	if (updated) {
		fs.writeFileSync(filePath, lines.join('\n'));
	}

	return updated;
};

export const updateCatalogEntry = ({
	workspaceRoot,
	pkg,
	newVersion,
}: {
	workspaceRoot: string;
	pkg: string;
	newVersion: string;
}): boolean => {
	const source = findCatalogSource(workspaceRoot);
	if (!source) {
		return false;
	}

	if (source.type === 'package-json') {
		return updateCatalogEntryInPackageJson({
			filePath: source.filePath,
			catalogKey: source.catalogKey,
			pkg,
			newVersion,
		});
	}

	return updateCatalogEntryInPnpmWorkspace({
		filePath: source.filePath,
		pkg,
		newVersion,
	});
};
