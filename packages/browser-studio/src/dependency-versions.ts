declare const __BROWSER_STUDIO_DEPENDENCY_VERSIONS__:
	| Record<string, string>
	| undefined;

const getInjectedDependencyVersions = () => {
	if (typeof __BROWSER_STUDIO_DEPENDENCY_VERSIONS__ === 'undefined') {
		throw new Error('Browser Studio dependency versions were not injected');
	}

	return __BROWSER_STUDIO_DEPENDENCY_VERSIONS__;
};

export const browserStudioDependencyVersions = getInjectedDependencyVersions();
