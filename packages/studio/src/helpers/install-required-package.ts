import type {ElementDependency} from '@remotion/studio-protocol';
import {installPackages} from '../api/install-package';
import {showNotification} from '../components/Notifications/NotificationCenter';

let installQueue: Promise<void> = Promise.resolve();

const uniqueDependencies = (
	dependencies: (ElementDependency | string)[],
): ElementDependency[] =>
	Array.from(
		new Map(
			dependencies.map((dependency) => {
				const normalized =
					typeof dependency === 'string'
						? {name: dependency, version: null}
						: dependency;
				return [normalized.name, normalized] as const;
			}),
		).values(),
	);

export const getMissingPackages = (
	dependencies: (ElementDependency | string)[],
) => {
	const installedPackages = window.remotion_installedPackages ?? [];
	return uniqueDependencies(dependencies).filter(
		(dependency) =>
			dependency.version !== null ||
			!installedPackages.includes(dependency.name),
	);
};

const addInstalledPackages = (dependencies: (ElementDependency | string)[]) => {
	const installedPackages = window.remotion_installedPackages ?? [];
	window.remotion_installedPackages = Array.from(
		new Set([
			...installedPackages,
			...uniqueDependencies(dependencies).map((dependency) => dependency.name),
		]),
	);
};

const formatPackageList = (dependencies: ElementDependency[]) =>
	dependencies.length === 1
		? dependencies[0]!.name
		: `${dependencies.length} packages`;

export const installRequiredPackages = async (
	dependencies: (ElementDependency | string)[],
): Promise<void> => {
	const runInstall = async () => {
		const missingPackages = getMissingPackages(dependencies);
		if (missingPackages.length === 0) return;
		showNotification(
			`Installing ${formatPackageList(missingPackages)}...`,
			3000,
		);
		await installPackages(missingPackages);
		addInstalledPackages(missingPackages);
		showNotification(`Installed ${formatPackageList(missingPackages)}`, 3000);
	};

	const queuedInstall = installQueue.then(runInstall, runInstall);
	installQueue = queuedInstall.catch(() => undefined);
	await queuedInstall;
};
