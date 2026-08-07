export type BrowserStudioWorkspacePackageExports = Record<
	string,
	{
		readonly exports: Record<string, string>;
		readonly packageRoot: string;
	}
>;

declare const __BROWSER_STUDIO_WORKSPACE_PACKAGE_EXPORTS__:
	| BrowserStudioWorkspacePackageExports
	| undefined;

export const getBrowserStudioWorkspacePackageExports = () => {
	if (typeof __BROWSER_STUDIO_WORKSPACE_PACKAGE_EXPORTS__ === 'undefined') {
		throw new Error(
			'Browser Studio workspace package exports were not injected',
		);
	}

	return __BROWSER_STUDIO_WORKSPACE_PACKAGE_EXPORTS__;
};

const getPackageName = (request: string) =>
	request.startsWith('@')
		? request.split('/').slice(0, 2).join('/')
		: request.split('/')[0];

export const resolveBrowserStudioWorkspacePackage = ({
	baseUrl,
	packages,
	request,
}: {
	baseUrl: string;
	packages: BrowserStudioWorkspacePackageExports;
	request: string;
}) => {
	const packageName = getPackageName(request);
	const workspacePackage = packages[packageName];
	if (!workspacePackage) {
		return null;
	}

	const subpath =
		request === packageName ? '.' : `.${request.slice(packageName.length)}`;
	let target = workspacePackage.exports[subpath];

	if (!target) {
		for (const [exportPattern, exportTarget] of Object.entries(
			workspacePackage.exports,
		)) {
			const wildcardIndex = exportPattern.indexOf('*');
			if (wildcardIndex === -1) {
				continue;
			}

			const prefix = exportPattern.slice(0, wildcardIndex);
			const suffix = exportPattern.slice(wildcardIndex + 1);
			if (!subpath.startsWith(prefix) || !subpath.endsWith(suffix)) {
				continue;
			}

			const wildcard = subpath.slice(
				prefix.length,
				suffix.length === 0 ? undefined : -suffix.length,
			);
			target = exportTarget.replace('*', wildcard);
			break;
		}
	}

	if (!target || !target.startsWith('./')) {
		throw new Error(
			`The repository package ${packageName} does not expose ${subpath} to Browser Studio.`,
		);
	}

	const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
	return new URL(
		`${workspacePackage.packageRoot}/${target.slice(2)}`,
		normalizedBaseUrl,
	).href;
};
