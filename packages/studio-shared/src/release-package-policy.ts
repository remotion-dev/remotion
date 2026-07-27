export const packagesRemovedInV5 = [
	'@remotion/light-leaks',
	'@remotion/media-parser',
	'@remotion/starburst',
	'@remotion/webcodecs',
] as const;

const packagesRemovedInV5Set = new Set<string>(packagesRemovedInV5);

export const shouldReleasePackage = ({
	packageName,
	releaseVersion,
}: {
	packageName: string;
	releaseVersion: string;
}) => {
	const majorVersion = Number.parseInt(releaseVersion.split('.')[0], 10);
	if (!Number.isInteger(majorVersion)) {
		throw new Error(`Invalid release version: ${releaseVersion}`);
	}

	return majorVersion < 5 || !packagesRemovedInV5Set.has(packageName);
};

type PackageJsonWithDependencies = {
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
};

type PackageJsonForRelease<T> = Omit<T, 'dependencies' | 'devDependencies'> &
	PackageJsonWithDependencies;

export const moveRemovedDependenciesToDevDependencies = <
	T extends PackageJsonWithDependencies,
>({
	packageJson,
	releaseVersion,
}: {
	packageJson: T;
	releaseVersion: string;
}): PackageJsonForRelease<T> => {
	const dependencies = {...packageJson.dependencies};
	const devDependencies = {...packageJson.devDependencies};
	let movedDependency = false;

	for (const [packageName, dependencyVersion] of Object.entries(dependencies)) {
		if (!shouldReleasePackage({packageName, releaseVersion})) {
			delete dependencies[packageName];
			devDependencies[packageName] = dependencyVersion;
			movedDependency = true;
		}
	}

	if (!movedDependency) {
		return packageJson as PackageJsonForRelease<T>;
	}

	return {...packageJson, dependencies, devDependencies};
};
